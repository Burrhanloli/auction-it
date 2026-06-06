import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m } from "motion/react";

import { ImageViewer } from "#/components/image-viewer";

export function BiddingState({ auction, activePlayer, categoryName, state }: any) {
  return (
    <m.div
      key="bidding"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex w-full flex-col items-center justify-center gap-8 md:flex-row md:items-center md:justify-center md:gap-16"
    >
      {/* Left Column: Player Image */}
      <div className="flex flex-col items-center">
        <m.div
          animate={{ y: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="group relative"
        >
          {activePlayer.imageUrl ? (
            <LazyImage
              src={activePlayer.imageUrl}
              alt={activePlayer.name}
              priority
              fallbackText={activePlayer.name}
              className="relative h-112 w-84 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain md:h-144 md:w-108"
            />
          ) : (
            <div className="relative flex h-112 w-84 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-5xl font-black text-[#bbbbbb] uppercase md:h-144 md:w-108 md:text-7xl">
              {activePlayer.name.slice(0, 2)}
            </div>
          )}
        </m.div>
      </div>

      {/* Right Column: Player Details */}
      <div className="flex w-full max-w-lg flex-col items-center gap-y-4 text-center md:items-start md:text-left">
        {/* Glowing category badge */}
        <span className="inline-flex items-center rounded-none border border-white bg-white px-3 py-1 text-xs font-bold tracking-[1.5px] text-black uppercase">
          <FlameIcon className="mr-1 size-4 animate-pulse" />
          {categoryName} Category
        </span>

        {/* Name and skills */}
        <div>
          <h2 className="mb-2 text-5xl font-black tracking-tight text-white md:text-6xl">
            {activePlayer.name}
          </h2>
          <span className="inline-block rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-2 text-sm font-bold tracking-[1.5px] text-[#bbbbbb] uppercase md:text-base">
            Skills: {activePlayer.skills}
          </span>
        </div>

        {/* Bidding values layout */}
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Left: Base Points */}
          <div className="flex flex-col items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 p-6">
            <span className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Base Price
            </span>
            <span className="mt-2 text-2xl font-bold text-white">
              {activePlayer.category?.basePoints} pts
            </span>
          </div>

          {/* Right: Current High Bid */}
          <div className="flex flex-col items-center justify-center rounded-none border border-white bg-white p-6 text-black">
            <span className="flex items-center text-xs font-black tracking-[1.5px] text-black uppercase">
              <span className="mr-2 size-2 animate-ping rounded-none bg-neutral-950" />
              Current Bid
            </span>
            <m.span
              key={state.currentBidPoints}
              initial={{ scale: 1.5, color: "#eab308" }}
              animate={{ scale: 1, color: "#000000" }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="mt-2 inline-block text-4xl font-black text-black"
            >
              {state.currentBidPoints} pts
            </m.span>
          </div>
        </div>

        {/* Winning Bidder Team Box */}
        <div className="flex w-full items-center justify-between rounded-none border border-[#3c3c3c] bg-neutral-950 p-6">
          <div className="flex items-center gap-x-2">
            {state.currentHighestBidderTeam ? (
              <>
                {state.currentHighestBidderTeam.logoUrl ? (
                  <ImageViewer
                    src={state.currentHighestBidderTeam.logoUrl}
                    alt={state.currentHighestBidderTeam.name}
                    className="size-14 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-contain"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg font-bold text-white uppercase">
                    {state.currentHighestBidderTeam.name.slice(0, 2)}
                  </div>
                )}
                <div className="text-left">
                  <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                    Leading Bidder
                  </span>
                  <span className="text-xl font-black text-white md:text-2xl">
                    {state.currentHighestBidderTeam.name}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-x-2 text-left">
                <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xl text-[#bbbbbb]">
                  👤
                </div>
                <div>
                  <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                    Leading Bidder
                  </span>
                  <span className="text-sm font-semibold text-[#bbbbbb] md:text-base">
                    Waiting for opening bid…
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex size-12 items-center justify-center rounded-none border border-white bg-white text-black">
            <Volume2Icon className="size-6 animate-pulse" />
          </div>
        </div>
      </div>
    </m.div>
  );
}
