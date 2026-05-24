import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlayIcon, GavelIcon, XOctagonIcon, TagIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  $getAuction,
  $getAuctionState,
  $drawPlayer,
  $incrementBid,
  $markSold,
  $markUnsold,
} from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/$auctionId/control")({
  component: AuctionControlPanel,
});

function AuctionControlPanel() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

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
        {/* Draw Player Console */}
        <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <h3 className="mb-6 flex items-center text-base font-bold tracking-[1.5px] text-white uppercase">
            <PlayIcon className="mr-2 h-5 w-5 text-white" />
            Roster Draw Deck
          </h3>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Select Category Deck
              </Label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
          <h3 className="mb-8 flex items-center text-base font-bold tracking-[1.5px] text-white uppercase">
            <GavelIcon className="mr-3 h-5 w-5 text-white" />
            Live Bidding Arena
          </h3>

          {isBidding ? (
            <BiddingFormConsole
              key={`${activePlayer.id}-${state.currentBidPoints}`}
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
  const bidForm = useForm({
    defaultValues: {
      biddingTeamId: state.currentHighestBidderTeamId || auction?.teams?.[0]?.id || "",
      customBidAmount: state.currentBidPoints + 20,
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

      placeBidMutation.mutate({
        auctionId,
        teamId: biddingTeamId,
        bidPoints: value.customBidAmount,
      });
    },
  });

  const incrementShortcut = (amount: number) => {
    bidForm.setFieldValue("customBidAmount", (prev) => prev + amount);
  };

  return (
    <div className="space-y-6">
      {/* Current Active Player row */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-none border border-[#3c3c3c] bg-black p-4 md:flex-row">
        <div className="flex items-center space-x-4">
          {activePlayer.imageUrl ? (
            <img
              src={activePlayer.imageUrl}
              alt={activePlayer.name}
              className="h-16 w-16 rounded-none border border-[#3c3c3c] bg-black object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-lg font-black text-[#bbbbbb] uppercase">
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
      <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-4 text-xs">
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {auction?.teams?.map((t: any) => {
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
                            {/* Top right status badge */}
                            {isSelected && (
                              <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-black text-white">
                                ✓
                              </div>
                            )}
                            {isInsufficient && (
                              <div className="absolute top-2 right-2 rounded-none bg-[#1a1a1a] px-1 py-0.5 text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                                No Budget
                              </div>
                            )}

                            <div className="flex w-full items-center space-x-2.5">
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.name}
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
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                      required
                    />
                    <bidForm.Subscribe
                      selector={(state) => state.isSubmitting}
                      children={(isSubmitting) => (
                        <Button
                          type="submit"
                          disabled={isSubmitting || placeBidMutation.isPending}
                          className="rounded-none border border-white bg-white px-6 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
                        >
                          {isSubmitting || placeBidMutation.isPending ? "Placing..." : "Place Bid"}
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
          <button
            type="button"
            onClick={() => incrementShortcut(10)}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] hover:bg-white hover:text-black"
          >
            +10
          </button>
          <button
            type="button"
            onClick={() => incrementShortcut(20)}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] hover:bg-white hover:text-black"
          >
            +20
          </button>
          <button
            type="button"
            onClick={() => incrementShortcut(50)}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] hover:bg-white hover:text-black"
          >
            +50
          </button>
          <button
            type="button"
            onClick={() => incrementShortcut(100)}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] hover:bg-white hover:text-black"
          >
            +100
          </button>
          <button
            type="button"
            onClick={() => {
              bidForm.setFieldValue("customBidAmount", state.currentBidPoints + 20);
            }}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-white hover:bg-white hover:text-black"
          >
            Reset Increment
          </button>
        </div>
      </form>

      {/* Mark SOLD or UNSOLD panels */}
      <div className="grid grid-cols-2 gap-4 border-t border-[#3c3c3c] pt-8">
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
