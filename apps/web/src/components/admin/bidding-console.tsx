import { useState } from "react";

import { ActivePlayerProfile } from "./active-player-profile";
import { BiddingActions } from "./bidding-actions";
import { BiddingFormPanel } from "./bidding-form-panel";

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

export function BiddingFormConsole({
  state,
  auction,
  auctionId,
  placeBidMutation,
  markSoldMutation,
  markUnsoldMutation,
  activePlayer,
  categoryColor,
}: BiddingFormConsoleProps) {
  return (
    <div className="space-y-1.5">
      <ActivePlayerProfile
        activePlayer={activePlayer}
        categoryColor={categoryColor}
        state={state}
      />

      <div className="flex flex-col items-start justify-between gap-3 rounded-none border border-[#3c3c3c] bg-neutral-950 p-4 text-xs md:flex-row md:items-center">
        <span className="font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Current Leading Bidder:
        </span>
        {state.currentHighestBidderTeam ? (
          <div className="flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1">
            <span className="size-2 rounded-full bg-[#0fa336]" />
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

      <BiddingFormPanel
        state={state}
        auction={auction}
        auctionId={auctionId}
        placeBidMutation={placeBidMutation}
        activePlayer={activePlayer}
      />

      <BiddingActions
        markSoldMutation={markSoldMutation}
        markUnsoldMutation={markUnsoldMutation}
        auctionId={auctionId}
        state={state}
      />
    </div>
  );
}
