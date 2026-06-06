import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m, AnimatePresence } from "motion/react";
import React from "react";

import { ImageViewer } from "#/components/image-viewer";
import { Logo } from "#/components/logo";

import { BiddingState } from "./states/bidding-state";
import { CompletedState } from "./states/completed-state";
import { DrawingState } from "./states/drawing-state";
import { IdleState } from "./states/idle-state";
import { SoldState } from "./states/sold-state";
import { UnsoldState } from "./states/unsold-state";

export type BiddingStatus = "completed" | "drawing" | "bidding" | "sold" | "unsold" | "idle";

export function ActiveBiddingArea({
  status,
  auction,
  activePlayer,
  categoryName,
  state,
}: {
  status: BiddingStatus;
  auction: any;
  activePlayer: any;
  categoryName: string;
  state: any;
}) {
  if (status === "completed") return <CompletedState />;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-y-4">
      <div className="relative flex min-h-[80vh] flex-1 flex-col items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4 md:p-6">
        {/* Background Watermark */}
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center opacity-10">
          {auction.logoUrl ? (
            <LazyImage
              src={auction.logoUrl}
              alt="Watermark"
              priority
              className="max-h-full max-w-full object-contain p-12 blur-[2px]"
            />
          ) : (
            <Logo className="size-96 blur-[2px]" />
          )}
        </div>

        <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            {/* STAGE 1: ACTIVE BIDDING */}
            {status === "drawing" && (
              <DrawingState
                auction={auction}
                activePlayer={activePlayer}
                categoryName={categoryName}
                state={state}
              />
            )}
            {status === "bidding" && (
              <BiddingState
                auction={auction}
                activePlayer={activePlayer}
                categoryName={categoryName}
                state={state}
              />
            )}

            {/* STAGE 2: SOLD CELEBRATION */}
            {status === "sold" && (
              <SoldState
                auction={auction}
                activePlayer={activePlayer}
                categoryName={categoryName}
                state={state}
              />
            )}

            {/* STAGE 3: UNSOLD SCREEN */}
            {status === "unsold" && (
              <UnsoldState
                auction={auction}
                activePlayer={activePlayer}
                categoryName={categoryName}
                state={state}
              />
            )}

            {/* STAGE 4: IDLE / PAUSED */}
            {status === "idle" && (
              <IdleState
                auction={auction}
                activePlayer={activePlayer}
                categoryName={categoryName}
                state={state}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
