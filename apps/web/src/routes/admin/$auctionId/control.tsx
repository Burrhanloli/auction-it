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
import { PlayIcon, GavelIcon } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "sonner";

import { BiddingFormConsole } from "#/components/admin/bidding-console";
import {
  AuctionPrompts,
  DeckManager,
  LogSidebar,
  AcquiredSquads,
  PreviewModals,
} from "#/components/admin/control-panels";
import { type CardVariant } from "#/components/player-sold-card";
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
  component: ControlConsolePage,
});

async function exportRosterCard(
  teamName: string,
  element: HTMLElement,
  setIsDownloading: (val: boolean) => void,
) {
  setIsDownloading(true);
  toast.info(`Preparing roster image for ${teamName}...`);
  try {
    const [{ toPng }] = await Promise.all([
      import("html-to-image"),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      width: 1080,
      height: 1080,
      imagePlaceholder:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    });

    const link = document.createElement("a");
    link.download = `${teamName.toLowerCase().replace(/\s+/g, "-")}-roster.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Successfully exported ${teamName}!`);
    setIsDownloading(false);
  } catch (err) {
    console.error("Roster export failed:", err);
    toast.error(`Failed to export roster.`);
    setIsDownloading(false);
  }
}

async function exportSoldCard(
  playerName: string,
  element: HTMLElement,
  setIsDownloadingSoldCard: (val: boolean) => void,
) {
  setIsDownloadingSoldCard(true);
  toast.info(`Preparing sold card for ${playerName}...`);
  try {
    const [{ toPng }] = await Promise.all([
      import("html-to-image"),
      new Promise((resolve) => setTimeout(resolve, 300)),
    ]);

    const dataUrl = await toPng(element, {
      cacheBust: true,
      pixelRatio: 2,
      width: 1080,
      height: 1080,
      imagePlaceholder:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    });

    const link = document.createElement("a");
    link.download = `${playerName.toLowerCase().replace(/\s+/g, "-")}-sold.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`Successfully exported ${playerName}!`);
    setIsDownloadingSoldCard(false);
  } catch (err) {
    console.error("Sold card export failed:", err);
    toast.error(`Failed to export sold card.`);
    setIsDownloadingSoldCard(false);
  }
}

// react-doctor-disable-next-line react-doctor/prefer-useReducer
function ControlConsolePage() {
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

  const [cardVariant, setCardVariant] = useState<CardVariant>("default");

  const handleDownloadRoster = async () => {
    if (!activeRosterTeam || !modalCardRef.current) return;
    await exportRosterCard(activeRosterTeam.name, modalCardRef.current, setIsDownloading);
  };

  const handleDownloadSoldCard = async () => {
    if (!activeSoldPlayerPreview || !modalSoldCardRef.current) return;
    await exportSoldCard(
      activeSoldPlayerPreview.player.name,
      modalSoldCardRef.current,
      setIsDownloadingSoldCard,
    );
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
  const [isManualDraw, setIsManualDraw] = useState(false);
  const [selectedManualPlayerId, setSelectedManualPlayerId] = useState("");

  const activeCategoryId = selectedCategoryId || auction?.categories?.[0]?.id || "";

  const unsoldPlayersInCategory =
    auction?.players?.filter(
      (p: any) => p.categoryId === activeCategoryId && p.status === "unsold",
    ) || [];

  // Mutations
  const drawPlayerMutation = useMutation({
    mutationFn: (vars: { auctionId: string; categoryId: string; playerId?: string }) =>
      $drawPlayer({ data: vars }),
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
    if (isManualDraw && !selectedManualPlayerId) {
      toast.error("Please select a player for manual draw!");
      return;
    }
    drawPlayerMutation.mutate({
      auctionId,
      categoryId: activeCategoryId,
      playerId: isManualDraw ? selectedManualPlayerId : undefined,
    });
  };

  const activePlayer = state?.currentPlayer;
  const isBidding = state?.stage === "bidding" && !!activePlayer;

  // Render borders
  const categoryColor =
    activePlayer?.category?.name?.toLowerCase() === "elite"
      ? "border-white text-black bg-white"
      : activePlayer?.category?.name?.toLowerCase() === "pro"
        ? "border-white text-white bg-neutral-950"
        : "border-[#3c3c3c] text-[#bbbbbb] bg-[#1a1a1a]";

  return (
    <div className="flex flex-col gap-y-8">
      {/* Top Global Status Banner */}
      <div className="w-full">
        <AuctionPrompts
          auction={auction}
          auctionId={auctionId}
          updateStatusMutation={updateStatusMutation}
        />
      </div>

      {/* Main Command Center Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Roster Deck (25%) */}
        <div className="flex h-full flex-col lg:col-span-3">
          {auction?.status === "active" ? (
            <DeckManager
              auction={auction}
              activeCategoryId={activeCategoryId}
              setSelectedCategoryId={setSelectedCategoryId}
              isBidding={isBidding}
              handleDrawPlayer={handleDrawPlayer}
              drawPlayerMutation={drawPlayerMutation}
              isManualDraw={isManualDraw}
              setIsManualDraw={setIsManualDraw}
              selectedManualPlayerId={selectedManualPlayerId}
              setSelectedManualPlayerId={setSelectedManualPlayerId}
              unsoldPlayersInCategory={unsoldPlayersInCategory}
            />
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-none border border-dashed border-[#3c3c3c] bg-[#1a1a1a] p-8 text-center text-xs text-[#bbbbbb]">
              <PlayIcon className="mb-3 size-6 text-[#3c3c3c]" />
              <p>
                Deck Manager locked.
                <br />
                Launch auction to access.
              </p>
            </div>
          )}
        </div>

        {/* Center Column: Live Bidding Arena (50%) */}
        <div className="flex h-full flex-col lg:col-span-6">
          <div className="relative flex h-full flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-8 flex items-center">
              <GavelIcon className="mr-3 size-5 text-white" />
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
              <div className="flex flex-1 flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                  💤
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                    Bidding Stage Inactive
                  </h4>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                    Draw a player from the Roster Deck to initialize the active bidding viewport.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Historical Logs (25%) */}
        <div className="flex h-full flex-col lg:col-span-3">
          <LogSidebar logs={logs} />
        </div>
      </div>

      {/* Bottom Full Width: Acquired Squads */}
      <div className="w-full">
        <AcquiredSquads
          auction={auction}
          auctionId={auctionId}
          revertPlayerMutation={revertPlayerMutation}
          setActiveSoldPlayerPreview={setActiveSoldPlayerPreview}
          setActiveRosterTeam={setActiveRosterTeam}
        />
      </div>

      <PreviewModals
        auction={auction}
        activeRosterTeam={activeRosterTeam}
        setActiveRosterTeam={setActiveRosterTeam}
        modalCardRef={modalCardRef}
        handleDownloadRoster={handleDownloadRoster}
        isDownloading={isDownloading}
        activeSoldPlayerPreview={activeSoldPlayerPreview}
        setActiveSoldPlayerPreview={setActiveSoldPlayerPreview}
        modalSoldCardRef={modalSoldCardRef}
        handleDownloadSoldCard={handleDownloadSoldCard}
        isDownloadingSoldCard={isDownloadingSoldCard}
        cardVariant={cardVariant}
        setCardVariant={setCardVariant}
      />
    </div>
  );
}
