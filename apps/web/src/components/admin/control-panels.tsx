import { Button } from "@repo/ui/components/button";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import {
  PlayIcon,
  XOctagonIcon,
  TrophyIcon,
  TagIcon,
  UsersIcon,
  ImageIcon,
  XIcon,
  Loader2Icon,
  DownloadIcon,
} from "lucide-react";

import { PlayerSoldCard } from "#/components/player-sold-card";
import { TeamRosterCard } from "#/components/team-roster-card";

export function AuctionPrompts({ auction, auctionId, updateStatusMutation }: any) {
  return (
    <>
      {auction?.status === "draft" && (
        <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <div className="flex items-center">
                <PlayIcon className="mr-3 size-5 text-white" />
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
              className="rounded-none border border-white bg-white px-8 py-3.5 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e]"
            >
              {updateStatusMutation.isPending ? "Launching…" : "Launch Auction"}
            </Button>
          </div>
        </div>
      )}

      {auction?.status === "active" && (
        <div className="rounded-none border border-[#e22718]/30 bg-[#1a1a1a] p-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <div className="flex items-center">
                <XOctagonIcon className="mr-3 size-5 text-[#e22718]" />
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
              className="rounded-none border border-[#e22718] bg-[#e22718] px-8 py-3.5 font-bold tracking-[1.5px] text-white uppercase hover:bg-neutral-950 hover:text-[#e22718] disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? "Ending…" : "End Auction"}
            </Button>
          </div>
        </div>
      )}

      {auction?.status === "completed" && (
        <div className="rounded-none border border-[#1c69d4]/30 bg-[#1a1a1a] p-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <div className="flex items-center">
                <TrophyIcon className="mr-3 size-5 text-[#1c69d4]" />
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
              className="rounded-none border border-[#1c69d4] bg-[#1c69d4] px-8 py-3.5 font-bold tracking-[1.5px] text-white uppercase hover:bg-neutral-950 hover:text-[#1c69d4]"
            >
              Generate Roster Cards
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function DeckManager({
  auction,
  activeCategoryId,
  setSelectedCategoryId,
  isBidding,
  handleDrawPlayer,
  drawPlayerMutation,
  isManualDraw,
  setIsManualDraw,
  selectedManualPlayerId,
  setSelectedManualPlayerId,
  unsoldPlayersInCategory,
}: any) {
  const isAuctionActive = auction?.status === "active";
  const disabledDraw = drawPlayerMutation.isPending || isBidding || !isAuctionActive;
  return (
    <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-6 flex items-center">
        <PlayIcon className="mr-3 size-5 text-white" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
            Roster Draw Deck
          </h3>
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="space-y-1.5">
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
                  disabled={isBidding || !isAuctionActive}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`relative flex flex-col items-start rounded-none border p-3.5 text-left transition-all duration-200 select-none ${
                    isBidding || !isAuctionActive
                      ? "cursor-not-allowed opacity-60"
                      : "cursor-pointer"
                  } ${
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-[#3c3c3c] bg-neutral-950 text-[#bbbbbb] hover:border-white"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-[10px] font-black text-white">
                      ✓
                    </div>
                  )}

                  <div className="flex w-full items-center gap-x-2">
                    <div
                      className={`flex size-8 items-center justify-center rounded-none border ${
                        isSelected
                          ? "border-black bg-neutral-950 text-white"
                          : "border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb]"
                      }`}
                    >
                      <TagIcon className="size-4" />
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

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="manual-draw-toggle"
              aria-label="Enable Manual Draw"
              checked={isManualDraw}
              onChange={(e) => setIsManualDraw(e.target.checked)}
              disabled={disabledDraw}
              className="size-4 cursor-pointer accent-white"
            />
            <Label
              htmlFor="manual-draw-toggle"
              className="cursor-pointer text-xs font-bold tracking-[1.5px] text-white uppercase"
            >
              Enable Manual Draw
            </Label>
          </div>

          {isManualDraw && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Select Player
              </Label>
              <select
                value={selectedManualPlayerId}
                onChange={(e) => setSelectedManualPlayerId(e.target.value)}
                disabled={disabledDraw}
                className="w-full rounded-none border border-[#3c3c3c] bg-neutral-950 p-3 text-sm text-white focus:border-white focus:outline-none disabled:opacity-50"
              >
                <option value="">-- Choose a player --</option>
                {unsoldPlayersInCategory?.map((player: any) => (
                  <option key={player.id} value={player.id}>
                    {player.name} ({player.skills})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            onClick={handleDrawPlayer}
            disabled={disabledDraw}
            className="w-full rounded-none border border-white bg-white py-3.5 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
          >
            {drawPlayerMutation.isPending
              ? "Drawing…"
              : isManualDraw
                ? "Draw Selected Player"
                : "Draw Random Player"}
          </Button>
        </div>
      </div>

      {isBidding && (
        <p className="mt-3 flex items-center text-[10px] font-bold tracking-[1.5px] text-white uppercase">
          ⚠️ Draw is locked while active player bidding is in progress. Finalize the active sale
          first.
        </p>
      )}
    </div>
  );
}

export function LogSidebar({ logs }: any) {
  return (
    <div className="lg:col-span-1">
      <div className="flex h-full flex-col rounded-none border border-[#3c3c3c] bg-neutral-950 p-6">
        <div className="mb-4 flex items-center justify-between border-b border-[#3c3c3c] pb-3">
          <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
            Bidding System Ticker
          </h3>
          <span className="animate-pulse text-[10px] font-bold tracking-[1.5px] text-white uppercase">
            Control
          </span>
        </div>

        <div className="max-h-[70vh] gap-y-4 overflow-y-auto pr-1">
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
  );
}

export function AcquiredSquads({
  auction,
  auctionId,
  revertPlayerMutation,
  setActiveSoldPlayerPreview,
  setActiveRosterTeam,
}: any) {
  return (
    <div
      id="acquired-squads-section"
      className="col-span-1 mt-6 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 lg:col-span-3"
    >
      <div className="mb-6 flex items-center">
        <UsersIcon className="mr-3 size-5 text-white" />
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
          squad.sort((a: any, b: any) => {
            if (a.status === "captain" && b.status !== "captain") return -1;
            if (a.status !== "captain" && b.status === "captain") return 1;
            return 0;
          });

          return (
            <div
              key={team.id}
              className="flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-neutral-950 p-4"
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
                  <div className="max-h-[300px] gap-y-4 overflow-y-auto pr-2">
                    {squad.map((player: any) => (
                      <div
                        key={player.id}
                        className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2"
                      >
                        <div>
                          <p className="text-xs font-bold text-white uppercase">{player.name}</p>
                          <p className="text-[10px] text-[#bbbbbb]">
                            {player.soldPoints} pts {player.status === "captain" ? "(Captain)" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => setActiveSoldPlayerPreview({ player, team })}
                            className="h-6 cursor-pointer rounded-none border border-white bg-transparent px-2 text-[8px] font-bold tracking-[1px] text-white uppercase hover:bg-white hover:text-black"
                            title="Generate Post"
                          >
                            <ImageIcon className="mr-1 size-3" />
                            Post
                          </Button>
                          {player.status !== "captain" && auction?.status !== "completed" && (
                            <Button
                              onClick={() => {
                                if (
                                  window.confirm(`Are you sure you want to revert ${player.name}?`)
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
  );
}

function VariantSelector({ cardVariant, setCardVariant }: any) {
  const variants = ["default", "minimal", "cyberpunk", "trading-card", "elegant"];
  return (
    <div className="mb-4 flex w-full flex-wrap gap-2">
      {variants.map((v) => (
        <Button
          key={v}
          onClick={() => setCardVariant(v)}
          variant={cardVariant === v ? "default" : "outline"}
          className={`h-8 rounded-none border ${
            cardVariant === v
              ? "border-white bg-white text-black"
              : "border-[#3c3c3c] bg-transparent text-[#bbbbbb] hover:bg-[#1a1a1a] hover:text-white"
          } px-3 text-[10px] font-bold tracking-[1px] uppercase`}
        >
          {v}
        </Button>
      ))}
    </div>
  );
}

export function PreviewModals({
  auction,
  activeRosterTeam,
  setActiveRosterTeam,
  modalCardRef,
  handleDownloadRoster,
  isDownloading,
  activeSoldPlayerPreview,
  setActiveSoldPlayerPreview,
  modalSoldCardRef,
  handleDownloadSoldCard,
  isDownloadingSoldCard,
  cardVariant,
  setCardVariant,
}: any) {
  return (
    <>
      {auction && activeRosterTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col items-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 shadow-2xl">
            <div className="mb-6 flex w-full items-center justify-between border-b border-[#3c3c3c] pb-4">
              <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                FRANCHISE ROSTER PREVIEW
              </h3>
              <button
                type="button"
                onClick={() => setActiveRosterTeam(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <VariantSelector cardVariant={cardVariant} setCardVariant={setCardVariant} />

            <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center overflow-hidden border border-neutral-900 bg-neutral-950">
              <div className="absolute top-0 left-0 size-[1080px] origin-top-left scale-[0.407]">
                <div ref={modalCardRef} className="size-[1080px]">
                  <TeamRosterCard
                    team={activeRosterTeam}
                    players={(auction.players ?? []).filter(
                      (p: any) =>
                        p.soldToTeamId === activeRosterTeam.id ||
                        (p.status === "captain" && activeRosterTeam.captainPlayerId === p.id),
                    )}
                    categories={auction.categories ?? []}
                    auction={auction as any}
                    variant={cardVariant}
                  />
                </div>
              </div>
            </div>

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
                className="flex-1 rounded-none border border-white bg-white text-xs font-black tracking-[1px] text-black uppercase hover:bg-neutral-950 hover:text-white"
              >
                {isDownloading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Generating PNG…
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 size-4" />
                    Download Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {auction && activeSoldPlayerPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4 backdrop-blur-sm">
          <div className="relative flex max-h-[95vh] w-full max-w-2xl flex-col items-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 shadow-2xl">
            <div className="mb-6 flex w-full items-center justify-between border-b border-[#3c3c3c] pb-4">
              <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                PLAYER SOLD PREVIEW
              </h3>
              <button
                type="button"
                onClick={() => setActiveSoldPlayerPreview(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="size-5" />
              </button>
            </div>

            <VariantSelector cardVariant={cardVariant} setCardVariant={setCardVariant} />

            <div className="relative flex aspect-square w-full max-w-[440px] items-center justify-center overflow-hidden border border-neutral-900 bg-neutral-950">
              <div className="absolute top-0 left-0 size-[1080px] origin-top-left scale-[0.407]">
                <div ref={modalSoldCardRef} className="size-[1080px]">
                  <PlayerSoldCard
                    player={activeSoldPlayerPreview.player}
                    team={activeSoldPlayerPreview.team}
                    auction={auction as any}
                    variant={cardVariant}
                  />
                </div>
              </div>
            </div>

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
                className="flex-1 rounded-none border border-white bg-white text-xs font-black tracking-[1px] text-black uppercase hover:bg-neutral-950 hover:text-white"
              >
                {isDownloadingSoldCard ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    Generating PNG…
                  </>
                ) : (
                  <>
                    <DownloadIcon className="mr-2 size-4" />
                    Download Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
