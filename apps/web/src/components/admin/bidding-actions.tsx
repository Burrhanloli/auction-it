import { Button } from "@repo/ui/components/button";
import { GavelIcon, XOctagonIcon } from "lucide-react";

export function BiddingActions({ markSoldMutation, markUnsoldMutation, auctionId, state }: any) {
  return (
    <div className="grid grid-cols-1 gap-4 border-t border-[#3c3c3c] pt-8 sm:grid-cols-2">
      <Button
        onClick={() => markSoldMutation.mutate(auctionId)}
        disabled={markSoldMutation.isPending || !state.currentHighestBidderTeamId}
        className="flex cursor-pointer items-center justify-center gap-x-2 rounded-none border border-white bg-white py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:opacity-50"
      >
        <GavelIcon className="size-4" />
        <span>Mark as Sold 🔨</span>
      </Button>

      <Button
        onClick={() => markUnsoldMutation.mutate(auctionId)}
        disabled={markUnsoldMutation.isPending}
        className="flex cursor-pointer items-center justify-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
      >
        <XOctagonIcon className="size-4 text-current" />
        <span>Mark as Unsold</span>
      </Button>
    </div>
  );
}
