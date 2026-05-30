import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PlayIcon,
  GavelIcon,
  XOctagonIcon,
  TagIcon,
  UsersIcon,
  TrophyIcon,
  XIcon,
  DownloadIcon,
  Loader2Icon,
  ImageIcon,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

import { PlayerSoldCard } from "#/components/player-sold-card";
import { TeamRosterCard } from "#/components/team-roster-card";
import {
  $getAuction,
  $getAuctionState,
  $drawPlayer,
  $incrementBid,
  $markSold,
  $markUnsold,
  $updateAuctionStatus,
  $revertPlayer,
} from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/$auctionId/control")({
  component: AuctionControlPanel,
});

function AuctionControlPanel() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

  const [activeRosterTeam, setActiveRosterTeam] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalCardRef = useRef<HTMLDivElement>(null);

  const [activeSoldPlayerPreview, setActiveSoldPlayerPreview] = useState<{
    player: any;
    team: any;
  } | null>(null);
  const [isDownloadingSoldCard, setIsDownloadingSoldCard] = useState(false);
  const modalSoldCardRef = useRef<HTMLDivElement>(null);

  const handleDownloadRoster = async () => {
    if (!activeRosterTeam || !modalCardRef.current) return;
    setIsDownloading(true);
    toast.info(`Preparing roster image for ${activeRosterTeam.name}...`);
    try {
      const { toPng } = await import("html-to-image");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(modalCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
      });

      const link = document.createElement("a");
      link.download = `${activeRosterTeam.name.toLowerCase().replace(/\s+/g, "-")}-roster.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported ${activeRosterTeam.name}!`);
    } catch (err) {
      console.error("Roster export failed:", err);
      toast.error(`Failed to export roster.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadSoldCard = async () => {
    if (!activeSoldPlayerPreview || !modalSoldCardRef.current) return;
    setIsDownloadingSoldCard(true);
    toast.info(`Preparing sold card for ${activeSoldPlayerPreview.player.name}...`);
    try {
      const { toPng } = await import("html-to-image");
      await new Promise((resolve) => setTimeout(resolve, 300));

      const dataUrl = await toPng(modalSoldCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1080,
        height: 1080,
      });

      const link = document.createElement("a");
      link.download = `${activeSoldPlayerPreview.player.name.toLowerCase().replace(/\s+/g, "-")}-sold.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Successfully exported player card!`);
    } catch (err) {
      console.error("Card export failed:", err);
      toast.error(`Failed to export card.`);
    } finally {
      setIsDownloadingSoldCard(false);
    }
  };

  // Queries
  const { data: auction } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  const { data: stateData } = useQuery({
    queryKey: ["auction-state", auctionId],
    queryFn: () => $getAuctionState({ data: auctionId }),
  });

  const state = stateData?.state;
  const logs = stateData?.logs ?? [];

  // Local state for actions
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const activeCategoryId = selectedCategoryId || auction?.categories?.[0]?.id || "";

  // Mutations
  const drawPlayerMutation = useMutation({
    mutationFn: (vars: { auctionId: string; categoryId: string }) => $drawPlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Random player drawn for bidding!");
      queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to draw player");
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: (vars: any) => $incrementBid({ data: vars }),
    onSuccess: () => {
      toast.success("Bid registered successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Bidding failed");
    },
  });

  const markSoldMutation = useMutation({
    mutationFn: (vars: any) => $markSold({ data: vars }),
    onSuccess: () => {
      toast.success("🔨 Player marked as SOLD!");
      queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to finalize sale");
    },
  });

  const markUnsoldMutation = useMutation({
    mutationFn: (vars: any) => $markUnsold({ data: vars }),
    onSuccess: () => {
      toast.success("💨 Player marked as UNSOLD!");
      queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to finalize status");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (vars: { auctionId: string; status: "draft" | "active" | "completed" }) =>
      $updateAuctionStatus({ data: vars }),
    onSuccess: () => {
      toast.success("Auction status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update auction status");
    },
  });

  const revertPlayerMutation = useMutation({
    mutationFn: (vars: { auctionId: string; playerId: string }) => $revertPlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Player reverted successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revert player");
    },
  });

  const handleDrawPlayer = () => {
    if (!activeCategoryId) {
      toast.error("Please select a category first!");
      return;
    }
    drawPlayerMutation.mutate({
      auctionId,
      categoryId: activeCategoryId,
    });
  };

  const activePlayer = state?.currentPlayer;
  const isBidding = state?.stage === "bidding" && !!activePlayer;

  // Render borders
  const categoryColor =
    activePlayer?.category?.name?.toLowerCase() === "elite"
      ? "border-white text-black bg-white"
      : activePlayer?.category?.name?.toLowerCase() === "pro"
        ? "border-white text-white bg-black"
        : "border-[#3c3c3c] text-[#bbbbbb] bg-[#1a1a1a]";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Left Column: Action board (Category selection, Draw button, bid console) (2/3 width) */}
      <div className="space-y-8 lg:col-span-2">
        {/* Launch Auction Prompt */}
        {auction?.status === "draft" && (
          <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center">
                  <PlayIcon className="mr-3 h-5 w-5 text-white" />
                  <div className="inline-flex flex-col">
                    <MStripeDivider className="mb-1 w-full" />
                    <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                      Auction is in Draft Mode
                    </h3>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[#bbbbbb]">
                  Launch the auction to move it to the Live Arena.
                </p>
              </div>
              <Button
                onClick={() => updateStatusMutation.mutate({ auctionId, status: "active" })}
                disabled={updateStatusMutation.isPending}
                className="rounded-none border border-white bg-white px-8 py-3.5 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e]"
              >
                {updateStatusMutation.isPending ? "Launching..." : "Launch Auction"}
              </Button>
            </div>
          </div>
        )}

        {/* End Auction Prompt */}
        {auction?.status === "active" && (
          <div className="rounded-none border border-[#e22718]/30 bg-[#1a1a1a] p-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center">
                  <XOctagonIcon className="mr-3 h-5 w-5 text-[#e22718]" />
                  <div className="inline-flex flex-col">
                    <MStripeDivider className="mb-1 w-full" />
                    <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                      End Auction Session
                    </h3>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[#bbbbbb]">
                  Close the auction. This will hide the live bidding view and lock all team rosters.
                </p>
              </div>
              <Button
                onClick={() => {
                  if (window.confirm("Are you sure you want to end this auction?")) {
                    updateStatusMutation.mutate({ auctionId, status: "completed" });
                  }
                }}
                disabled={updateStatusMutation.isPending}
                className="rounded-none border border-[#e22718] bg-[#e22718] px-8 py-3.5 font-bold tracking-[1.5px] text-white uppercase hover:bg-black hover:text-[#e22718] disabled:opacity-50"
              >
                {updateStatusMutation.isPending ? "Ending..." : "End Auction"}
              </Button>
            </div>
          </div>
        )}

        {/* Auction Completed - Generate Roster CTA */}
        {auction?.status === "completed" && (
          <div className="rounded-none border border-[#1c69d4]/30 bg-[#1a1a1a] p-8">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <div>
                <div className="flex items-center">
                  <TrophyIcon className="mr-3 h-5 w-5 text-[#1c69d4]" />
                  <div className="inline-flex flex-col">
                    <MStripeDivider className="mb-1 w-full" />
                    <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                      Auction Completed!
                    </h3>
                  </div>
                </div>
                <p className="mt-1 text-xs text-[#bbbbbb]">
                  Generate and download premium team roster social graphics for Instagram/Twitter.
                </p>
              </div>
              <Button
                onClick={() => {
                  const el = document.getElementById("acquired-squads-section");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-none border border-[#1c69d4] bg-[#1c69d4] px-8 py-3.5 font-bold tracking-[1.5px] text-white uppercase hover:bg-black hover:text-[#1c69d4]"
              >
                Generate Roster Cards
              </Button>
            </div>
          </div>
        )}

        {/* Draw Player Console */}
        <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <div className="mb-6 flex items-center">
            <PlayIcon className="mr-3 h-5 w-5 text-white" />
            <div className="inline-flex flex-col">
              <MStripeDivider className="mb-2 w-full" />
              <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                Roster Draw Deck
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Select Category Deck
              </Label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {auction?.categories?.map((cat: any) => {
                  const isSelected = activeCategoryId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      disabled={isBidding}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`relative flex flex-col items-start rounded-none border p-3.5 text-left transition-all duration-200 select-none ${
                        isBidding ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                      } ${
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-[#3c3c3c] bg-black text-[#bbbbbb] hover:border-white"
                      }`}
                    >
                      {/* Top right status badge */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-black text-white">
                          ✓
                        </div>
                      )}

                      <div className="flex w-full items-center space-x-2.5">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-none border ${
                            isSelected
                              ? "border-black bg-black text-white"
                              : "border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb]"
                          }`}
                        >
                          <TagIcon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="truncate text-xs leading-tight font-black text-[currentcolor]">
                            {cat.name}
                          </h5>
                          <span className="mt-0.5 block truncate text-[10px] font-bold text-[currentcolor] opacity-80">
                            Base: {cat.basePoints} pts
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={handleDrawPlayer}
              disabled={drawPlayerMutation.isPending || isBidding}
              className="w-full rounded-none border border-white bg-white py-3.5 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
            >
              {drawPlayerMutation.isPending ? "Drawing..." : "Draw Random Player"}
            </Button>
          </div>

          {isBidding && (
            <p className="mt-3 flex items-center text-[10px] font-bold tracking-[1.5px] text-white uppercase">
              ⚠️ Draw is locked while active player bidding is in progress. Finalize the active sale
              first.
            </p>
          )}
        </div>

        {/* Active Bidding Desk */}
        <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <div className="mb-8 flex items-center">
            <GavelIcon className="mr-3 h-5 w-5 text-white" />
            <div className="inline-flex flex-col">
              <MStripeDivider className="mb-2 w-full" />
              <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                Live Bidding Arena
              </h3>
            </div>
          </div>

          {isBidding ? (
            <BiddingFormConsole
              key={activePlayer.id}
              state={state}
              auction={auction}
              auctionId={auctionId}
              placeBidMutation={placeBidMutation}
              markSoldMutation={markSoldMutation}
              markUnsoldMutation={markUnsoldMutation}
              activePlayer={activePlayer}
              categoryColor={categoryColor}
            />
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-black py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                💤
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                  Bidding Stage Inactive
                </h4>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                  Draw a player from the Roster Deck above to initialize the active bidding
                  viewport.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Historical logs tracker sidebar (1/3 width) */}
      <div className="lg:col-span-1">
        <div className="flex h-full flex-col rounded-none border border-[#3c3c3c] bg-black p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#3c3c3c] pb-3">
            <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
              Bidding System Ticker
            </h3>
            <span className="animate-pulse text-[10px] font-bold tracking-[1.5px] text-white uppercase">
              Control
            </span>
          </div>

          <div className="max-h-[70vh] space-y-3 overflow-y-auto pr-1">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-3 text-xs leading-relaxed text-[#bbbbbb]"
              >
                <div className="mb-1 flex items-center justify-between text-[8px] text-[#7e7e7e]">
                  <span>LOG RECORD</span>
                  <span>
                    {new Date(log.createdAt).toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })}
                  </span>
                </div>
                {log.message}
              </div>
            ))}
            {logs.length === 0 && (
              <p className="py-8 text-center text-xs text-[#bbbbbb]">No log entries available.</p>
            )}
          </div>
        </div>
      </div>

      {/* Acquired Squads Section */}
      <div
        id="acquired-squads-section"
        className="col-span-1 mt-6 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 lg:col-span-3"
      >
        <div className="mb-6 flex items-center">
          <UsersIcon className="mr-3 h-5 w-5 text-white" />
          <div className="inline-flex flex-col">
            <MStripeDivider className="mb-2 w-full" />
            <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
              Acquired Squads & Reversions
            </h3>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {auction?.teams?.map((team: any) => {
            const squad = auction.players?.filter((p: any) => p.soldToTeamId === team.id) || [];

            return (
              <div
                key={team.id}
                className="flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-black p-4"
              >
                <div>
                  <div className="mb-4 flex items-center justify-between border-b border-[#3c3c3c] pb-2">
                    <h4 className="text-sm font-bold tracking-[1px] text-white uppercase">
                      {team.name}
                    </h4>
                    <span className="text-[10px] font-bold text-[#bbbbbb]">
                      {team.remainingBudget} pts
                    </span>
                  </div>
                  {squad.length > 0 ? (
                    <div className="max-h-[300px] space-y-3 overflow-y-auto pr-2">
                      {squad.map((player: any) => (
                        <div
                          key={player.id}
                          className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2"
                        >
                          <div>
                            <p className="text-xs font-bold text-white uppercase">{player.name}</p>
                            <p className="text-[10px] text-[#bbbbbb]">
                              {player.soldPoints} pts{" "}
                              {player.status === "captain" ? "(Captain)" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              onClick={() => setActiveSoldPlayerPreview({ player, team })}
                              className="h-6 cursor-pointer rounded-none border border-white bg-transparent px-2 text-[8px] font-bold tracking-[1px] text-white uppercase hover:bg-white hover:text-black"
                              title="Generate Post"
                            >
                              <ImageIcon className="mr-1 h-3 w-3" />
                              Post
                            </Button>
                            {player.status !== "captain" && (
                              <Button
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      `Are you sure you want to revert ${player.name}?`,
                                    )
                                  ) {
                                    revertPlayerMutation.mutate({
                                      auctionId,
                                      playerId: player.id,
                                    });
                                  }
                                }}
                                disabled={revertPlayerMutation.isPending}
                                className="h-6 cursor-pointer rounded-none border border-[#e22718] bg-transparent px-2 text-[8px] font-bold tracking-[1px] text-[#e22718] uppercase hover:bg-[#e22718] hover:text-white disabled:opacity-50"
                              >
                                Revert
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#bbbbbb] italic">No players acquired yet.</p>
                  )}
                </div>

                <div className="mt-4 flex justify-end border-t border-[#3c3c3c] pt-3">
                  <Button
                    onClick={() => setActiveRosterTeam(team)}
                    className="h-7 cursor-pointer rounded-none border border-white bg-transparent px-3 text-[10px] font-bold tracking-[1px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    View Roster
                  </Button>
                </div>
              </div>
            );
          })}

          {(!auction?.teams || auction.teams.length === 0) && (
            <div className="col-span-full py-8 text-center text-xs text-[#bbbbbb]">
              No teams registered yet.
            </div>
          )}
        </div>
      </div>

      {/* Roster Preview Modal Dialog Overlay */}
      {auction && activeRosterTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col items-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex w-full items-center justify-between border-b border-[#3c3c3c] pb-4">
              <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                FRANCHISE ROSTER PREVIEW
              </h3>
              <button
                onClick={() => setActiveRosterTeam(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scaled Roster Card container */}
            <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center overflow-hidden border border-neutral-900 bg-black">
              {/* Outer scaling wrapper */}
              <div className="absolute top-0 left-0 h-[1080px] w-[1080px] origin-top-left scale-[0.407]">
                {/* Captured element */}
                <div ref={modalCardRef} className="h-[1080px] w-[1080px]">
                  <TeamRosterCard
                    team={activeRosterTeam}
                    players={(auction.players ?? []).filter(
                      (p: any) =>
                        p.soldToTeamId === activeRosterTeam.id ||
                        (p.status === "captain" && activeRosterTeam.captainPlayerId === p.id),
                    )}
                    categories={auction.categories ?? []}
                    auction={auction as any}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex w-full gap-4 border-t border-[#3c3c3c] pt-4">
              <Button
                onClick={() => setActiveRosterTeam(null)}
                variant="outline"
                className="flex-1 rounded-none border-[#3c3c3c] bg-transparent text-xs font-bold tracking-[1px] text-[#bbbbbb] uppercase hover:bg-[#1a1a1a] hover:text-white"
              >
                Close Preview
              </Button>
              <Button
                onClick={handleDownloadRoster}
                disabled={isDownloading}
                className="flex-1 rounded-none border border-white bg-white text-xs font-black tracking-[1px] text-black uppercase hover:bg-black hover:text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Generating PNG...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Sold Player Preview Modal Dialog Overlay */}
      {auction && activeSoldPlayerPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col items-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 shadow-2xl">
            {/* Modal Header */}
            <div className="mb-6 flex w-full items-center justify-between border-b border-[#3c3c3c] pb-4">
              <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                PLAYER SOLD PREVIEW
              </h3>
              <button
                onClick={() => setActiveSoldPlayerPreview(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scaled Sold Card container */}
            <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center overflow-hidden border border-neutral-900 bg-black">
              {/* Outer scaling wrapper */}
              <div className="absolute top-0 left-0 h-[1080px] w-[1080px] origin-top-left scale-[0.407]">
                {/* Captured element */}
                <div ref={modalSoldCardRef} className="h-[1080px] w-[1080px]">
                  <PlayerSoldCard
                    player={activeSoldPlayerPreview.player}
                    team={activeSoldPlayerPreview.team}
                    auction={auction as any}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex w-full gap-4 border-t border-[#3c3c3c] pt-4">
              <Button
                onClick={() => setActiveSoldPlayerPreview(null)}
                variant="outline"
                className="flex-1 rounded-none border-[#3c3c3c] bg-transparent text-xs font-bold tracking-[1px] text-[#bbbbbb] uppercase hover:bg-[#1a1a1a] hover:text-white"
              >
                Close Preview
              </Button>
              <Button
                onClick={handleDownloadSoldCard}
                disabled={isDownloadingSoldCard}
                className="flex-1 rounded-none border border-white bg-white text-xs font-black tracking-[1px] text-black uppercase hover:bg-black hover:text-white"
              >
                {isDownloadingSoldCard ? (
                  <>
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                    Generating PNG...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Download Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface BiddingFormConsoleProps {
  state: any;
  auction: any;
  auctionId: string;
  placeBidMutation: any;
  markSoldMutation: any;
  markUnsoldMutation: any;
  activePlayer: any;
  categoryColor: string;
}

function BiddingFormConsole({
  state,
  auction,
  auctionId,
  placeBidMutation,
  markSoldMutation,
  markUnsoldMutation,
  activePlayer,
  categoryColor,
}: BiddingFormConsoleProps) {
  const [lastIncrement, setLastIncrement] = useState<number | null>(100);
  const hotkeyQueue = useRef<Promise<any>>(Promise.resolve());
  const pendingBidAmountRef = useRef<number>(state.currentBidPoints);

  const getHotkeyForIndex = (index: number) => {
    if (index < 9) return (index + 1).toString();
    return String.fromCharCode(97 + (index - 9)); // a, b, c...
  };

  const bidForm = useForm({
    defaultValues: {
      biddingTeamId: state.currentHighestBidderTeamId || auction?.teams?.[0]?.id || "",
      customBidAmount: state.currentBidPoints + 100,
    },
    onSubmit: async ({ value }) => {
      const biddingTeamId = value.biddingTeamId || auction?.teams?.[0]?.id;
      if (!activePlayer?.id) {
        toast.error("No active player is currently drawn!");
        return;
      }
      if (!biddingTeamId) {
        toast.error("Please select a bidding team!");
        return;
      }

      // Client-side budget boundary checks to give helpful early feedback!
      const team = auction?.teams?.find((t: any) => t.id === biddingTeamId);
      if (team && value.customBidAmount > team.remainingBudget) {
        toast.error(
          `Insufficient Budget! "${team.name}" has only ${team.remainingBudget} points, but the bid is ${value.customBidAmount} points.`,
        );
        return;
      }

      const newBid = value.customBidAmount;
      const increment = lastIncrement !== null ? lastIncrement : 100;

      // Optimistically update
      pendingBidAmountRef.current = newBid;
      bidForm.setFieldValue("customBidAmount", newBid + increment);

      hotkeyQueue.current = hotkeyQueue.current
        .then(() => {
          return placeBidMutation.mutateAsync({
            auctionId,
            teamId: biddingTeamId,
            bidPoints: newBid,
          });
        })
        .catch((err: any) => {
          pendingBidAmountRef.current = state.currentBidPoints;
          bidForm.setFieldValue("customBidAmount", state.currentBidPoints + increment);
        });
    },
  });

  useEffect(() => {
    // Only resync if the actual state passes our optimistic pending amount
    if (state.currentBidPoints > pendingBidAmountRef.current) {
      pendingBidAmountRef.current = state.currentBidPoints;
      if (lastIncrement !== null) {
        bidForm.setFieldValue("customBidAmount", state.currentBidPoints + lastIncrement);
      }
    } else if (lastIncrement !== null && pendingBidAmountRef.current === state.currentBidPoints) {
      // Regular sync when not in middle of optimistic queued bids
      bidForm.setFieldValue("customBidAmount", state.currentBidPoints + lastIncrement);
    }
  }, [state.currentBidPoints]);

  const hotkeyConfigs: UseHotkeyDefinition[] = [
    {
      hotkey: "Enter",
      callback: (e: any) => {
        if (e) e.preventDefault();
        bidForm.handleSubmit();
      },
    },
  ];

  auction?.teams?.forEach((team: any, index: number) => {
    hotkeyConfigs.push({
      hotkey: getHotkeyForIndex(index) as any,
      callback: () => {
        bidForm.setFieldValue("biddingTeamId", team.id);
      },
    });
  });

  useHotkeys(hotkeyConfigs);

  const incrementShortcut = (amount: number) => {
    setLastIncrement(amount);
    bidForm.setFieldValue("customBidAmount", state.currentBidPoints + amount);
  };

  const incrementOptions = [100, 200, 500, 1000, 2000, 3000, 4000, 5000];

  return (
    <div className="space-y-6">
      {/* Current Active Player row */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-none border border-[#3c3c3c] bg-black p-4 md:flex-row">
        <div className="flex items-center space-x-4">
          {activePlayer.imageUrl ? (
            <LazyImage
              src={activePlayer.imageUrl}
              alt={activePlayer.name}
              priority
              fallbackText={activePlayer.name}
              className="h-24 w-16 rounded-none border border-[#3c3c3c] bg-black object-cover"
            />
          ) : (
            <div className="flex h-24 w-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-lg font-black text-[#bbbbbb] uppercase">
              {activePlayer.name.slice(0, 2)}
            </div>
          )}
          <div className="text-left">
            <span
              className={`mb-1 inline-block rounded-none border border-solid px-2 py-0.5 text-[8px] font-black tracking-[1.5px] uppercase ${categoryColor}`}
            >
              {activePlayer.category?.name}
            </span>
            <h4 className="text-lg font-black text-white uppercase">{activePlayer.name}</h4>
            <span className="text-[10px] font-bold text-[#bbbbbb]">
              Skills: {activePlayer.skills}
            </span>
          </div>
        </div>

        <div className="flex space-x-6 text-right md:pr-4">
          <div>
            <span className="block text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Base Price
            </span>
            <span className="text-sm font-bold text-white">
              {activePlayer.category?.basePoints} pts
            </span>
          </div>
          <div className="h-8 border-l border-[#3c3c3c]" />
          <div>
            <span className="block text-[9px] font-black tracking-[1.5px] text-white uppercase">
              High Bid
            </span>
            <span className="text-base font-black text-white">{state.currentBidPoints} pts</span>
          </div>
        </div>
      </div>

      {/* Bidding high bidder log block */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-none border border-[#3c3c3c] bg-black p-4 text-xs md:flex-row md:items-center">
        <span className="font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Current Leading Bidder:
        </span>
        {state.currentHighestBidderTeam ? (
          <div className="flex items-center space-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1">
            <span className="h-2 w-2 rounded-full bg-[#0fa336]" />
            <span className="font-bold tracking-[1.5px] text-white uppercase">
              {state.currentHighestBidderTeam.name}
            </span>
            <span className="text-[10px] text-[#bbbbbb]">
              ({state.currentHighestBidderTeam.remainingBudget} remaining)
            </span>
          </div>
        ) : (
          <span className="text-[#bbbbbb] italic">
            No bids placed. Player defaults to Category Base points.
          </span>
        )}
      </div>

      {/* Form to submit a bid */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          bidForm.handleSubmit();
        }}
        className="space-y-4 border-t border-[#3c3c3c] pt-2"
      >
        <div className="space-y-6">
          <bidForm.Field
            name="biddingTeamId"
            children={(field) => (
              <div className="space-y-3">
                <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                  Select Bidding Team
                </Label>
                <bidForm.Subscribe
                  selector={(state) => state.values.customBidAmount}
                  children={(customBidAmount) => (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {auction?.teams?.map((t: any, index: number) => {
                        const isSelected = (field.state.value || auction?.teams?.[0]?.id) === t.id;
                        const isInsufficient = t.remainingBudget < (customBidAmount || 0);

                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              if (!isInsufficient) {
                                field.handleChange(t.id);
                              } else {
                                toast.error(`"${t.name}" has insufficient budget for this bid!`);
                              }
                            }}
                            className={`relative flex flex-col items-start rounded-none border p-3 text-left transition-all duration-200 select-none ${
                              isSelected
                                ? "border-white bg-white text-black"
                                : isInsufficient
                                  ? "cursor-not-allowed border-[#3c3c3c] bg-transparent opacity-55"
                                  : "border-[#3c3c3c] bg-black hover:border-white hover:text-white"
                            }`}
                          >
                            <div className="absolute top-2 right-2 flex items-center space-x-1">
                              <Badge
                                variant="outline"
                                className="h-4 rounded-none border-[#3c3c3c] bg-black px-1 py-0 text-[8px] font-black text-[#bbbbbb] uppercase"
                              >
                                {getHotkeyForIndex(index)}
                              </Badge>
                              {/* Top right status badge */}
                              {isSelected && (
                                <div className="flex h-4 w-4 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-black text-white">
                                  ✓
                                </div>
                              )}
                              {isInsufficient && (
                                <div className="rounded-none bg-[#1a1a1a] px-1 py-0.5 text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                                  No Budget
                                </div>
                              )}
                            </div>

                            <div className="flex w-full items-center space-x-2.5">
                              {t.logoUrl ? (
                                <LazyImage
                                  src={t.logoUrl}
                                  alt={t.name}
                                  priority
                                  fallbackText={t.name}
                                  className="h-7 w-7 rounded-none border border-[#3c3c3c] bg-black object-cover"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-black text-[#bbbbbb] uppercase">
                                  {t.name.slice(0, 2)}
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <h5 className="truncate text-xs leading-tight font-black text-[currentcolor]">
                                  {t.name}
                                </h5>
                                <span
                                  className={`text-[10px] font-bold text-[currentcolor] opacity-80`}
                                >
                                  {t.remainingBudget} pts
                                </span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                />
              </div>
            )}
          />

          <div className="border-t border-[#3c3c3c] pt-4">
            <bidForm.Field
              name="customBidAmount"
              children={(field) => (
                <div className="space-y-2">
                  <Label
                    htmlFor={field.name}
                    className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
                  >
                    Bid Points Value
                  </Label>
                  <div className="flex max-w-md space-x-2">
                    <Input
                      id={field.name}
                      type="number"
                      value={field.state.value}
                      onChange={(e) => {
                        field.handleChange(Number(e.target.value));
                        setLastIncrement(null);
                      }}
                      className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                      required
                    />
                    <bidForm.Subscribe
                      selector={(state) => state.isSubmitting}
                      children={(isSubmitting) => (
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="rounded-none border border-white bg-white px-6 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:opacity-50"
                        >
                          {isSubmitting ? "Placing..." : "Place Bid"}
                        </Button>
                      )}
                    />
                  </div>
                </div>
              )}
            />
          </div>
        </div>

        {/* Bidding shortcuts */}
        <div className="flex flex-wrap gap-2 pt-1.5">
          <span className="mr-1 self-center text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
            Quick Increments:
          </span>
          {incrementOptions.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => incrementShortcut(amount)}
              className={`cursor-pointer rounded-none border px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] transition-colors ${
                lastIncrement === amount
                  ? "border-white bg-white text-black"
                  : "border-[#3c3c3c] bg-black text-[#bbbbbb] hover:bg-[#1a1a1a] hover:text-white"
              }`}
            >
              +{amount}
            </button>
          ))}
          <button
            type="button"
            onClick={() => {
              setLastIncrement(null);
              bidForm.setFieldValue("customBidAmount", state.currentBidPoints + 100);
            }}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-white hover:bg-[#1a1a1a]"
          >
            Reset
          </button>
        </div>
      </form>

      {/* Mark SOLD or UNSOLD panels */}
      <div className="grid grid-cols-1 gap-4 border-t border-[#3c3c3c] pt-8 sm:grid-cols-2">
        <Button
          onClick={() => markSoldMutation.mutate(auctionId)}
          disabled={markSoldMutation.isPending || !state.currentHighestBidderTeamId}
          className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-none border border-white bg-white py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:opacity-50"
        >
          <GavelIcon className="h-4 w-4" />
          <span>Mark as Sold 🔨</span>
        </Button>

        <Button
          onClick={() => markUnsoldMutation.mutate(auctionId)}
          disabled={markUnsoldMutation.isPending}
          className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
        >
          <XOctagonIcon className="h-4 w-4 text-current" />
          <span>Mark as Unsold</span>
        </Button>
      </div>
    </div>
  );
}
