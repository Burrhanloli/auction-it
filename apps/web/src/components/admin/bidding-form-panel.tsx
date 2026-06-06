/* eslint-disable react-hooks-js/set-state-in-effect */
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { useForm } from "@tanstack/react-form";
import { useHotkeys, type UseHotkeyDefinition } from "@tanstack/react-hotkeys";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

const getHotkeyForIndex = (index: number) => {
  if (index < 9) return (index + 1).toString();
  return String.fromCharCode(97 + (index - 9)); // a, b, c…
};

interface BiddingFormPanelProps {
  state: any;
  auction: any;
  auctionId: string;
  placeBidMutation: any;
  activePlayer: any;
}

export function BiddingFormPanel({
  state,
  auction,
  auctionId,
  placeBidMutation,
  activePlayer,
}: BiddingFormPanelProps) {
  const [lastIncrement, setLastIncrement] = useState<number | null>(100);
  const [customBidAmount, setCustomBidAmount] = useState(state.currentBidPoints + 100);

  const hotkeyQueue = useRef<Promise<any>>(null as any);
  const pendingBidAmountRef = useRef<number>(state.currentBidPoints);

  // react-doctor-disable-next-line react-doctor/no-event-handler
  useEffect(() => {
    if (state.currentBidPoints > pendingBidAmountRef.current) {
      pendingBidAmountRef.current = state.currentBidPoints;
      // react-doctor-disable-next-line react-doctor/no-event-handler
      if (lastIncrement !== null) {
        // react-doctor-disable-next-line react-doctor/no-derived-state
        setCustomBidAmount(state.currentBidPoints + lastIncrement);
      }
    } else if (lastIncrement !== null && pendingBidAmountRef.current === state.currentBidPoints) {
      // react-doctor-disable-next-line react-doctor/no-derived-state
      setCustomBidAmount(state.currentBidPoints + lastIncrement);
    }
  }, [state.currentBidPoints, lastIncrement]);

  const bidForm = useForm({
    defaultValues: {
      biddingTeamId: state.currentHighestBidderTeamId || auction?.teams?.[0]?.id || "",
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

      const team = auction?.teams?.find((t: any) => t.id === biddingTeamId);
      if (team && customBidAmount > team.remainingBudget) {
        toast.error(
          `Insufficient Budget! "${team.name}" has only ${team.remainingBudget} points, but the bid is ${customBidAmount} points.`,
        );
        return;
      }

      const newBid = customBidAmount;
      const increment = lastIncrement !== null ? lastIncrement : 100;

      pendingBidAmountRef.current = newBid;
      setCustomBidAmount(newBid + increment);

      if (!hotkeyQueue.current) hotkeyQueue.current = Promise.resolve();
      hotkeyQueue.current = hotkeyQueue.current
        .then(() => {
          return placeBidMutation.mutateAsync({
            auctionId,
            teamId: biddingTeamId,
            bidPoints: newBid,
          });
        })
        .catch(() => {
          pendingBidAmountRef.current = state.currentBidPoints;
          setCustomBidAmount(state.currentBidPoints + increment);
        });
    },
  });

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
    setCustomBidAmount(state.currentBidPoints + amount);
  };

  const incrementOptions = [100, 200, 500, 1000, 2000, 3000, 4000, 5000];

  return (
    <div className="gap-y-4 border-t border-[#3c3c3c] pt-2">
      <div className="space-y-1.5">
        <bidForm.Field name="biddingTeamId">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Select Bidding Team
              </Label>
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
                            : "border-[#3c3c3c] bg-neutral-950 hover:border-white hover:text-white"
                      }`}
                    >
                      <div className="absolute top-2 right-2 flex items-center gap-x-2">
                        <Badge
                          variant="outline"
                          className="h-4 rounded-none border-[#3c3c3c] bg-neutral-950 px-1 py-0 text-[8px] font-black text-[#bbbbbb] uppercase"
                        >
                          {getHotkeyForIndex(index)}
                        </Badge>
                        {isSelected && (
                          <div className="flex size-4 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-[10px] font-black text-white">
                            ✓
                          </div>
                        )}
                        {isInsufficient && (
                          <div className="rounded-none bg-[#1a1a1a] px-1 py-0.5 text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                            No Budget
                          </div>
                        )}
                      </div>

                      <div className="flex w-full items-center gap-x-2">
                        {t.logoUrl ? (
                          <LazyImage
                            src={t.logoUrl}
                            alt={t.name}
                            priority
                            fallbackText={t.name}
                            className="size-7 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain"
                          />
                        ) : (
                          <div className="flex size-7 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-[10px] font-black text-[#bbbbbb] uppercase">
                            {t.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="truncate text-xs leading-tight font-black text-[currentcolor]">
                            {t.name}
                          </h5>
                          <span className={`text-[10px] font-bold text-[currentcolor] opacity-80`}>
                            {t.remainingBudget} pts
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </bidForm.Field>

        <div className="border-t border-[#3c3c3c] pt-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="customBidAmountInput"
              className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
            >
              Bid Points Value
            </Label>
            <div className="flex max-w-md gap-x-2">
              <Input
                id="customBidAmountInput"
                type="number"
                value={customBidAmount}
                onChange={(e) => {
                  setCustomBidAmount(Number(e.target.value));
                  setLastIncrement(null);
                }}
                className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                required
              />
              <bidForm.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <Button
                    type="button"
                    onClick={() => bidForm.handleSubmit()}
                    disabled={isSubmitting}
                    className="rounded-none border border-white bg-white px-6 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:opacity-50"
                  >
                    {isSubmitting ? "Placing…" : "Place Bid"}
                  </Button>
                )}
              />
            </div>
          </div>
        </div>
      </div>

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
                : "border-[#3c3c3c] bg-neutral-950 text-[#bbbbbb] hover:bg-[#1a1a1a] hover:text-white"
            }`}
          >
            +{amount}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setLastIncrement(null);
            setCustomBidAmount(state.currentBidPoints + 100);
          }}
          className="cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 px-2.5 py-1 text-[10px] font-bold tracking-[1.5px] text-white hover:bg-[#1a1a1a]"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
