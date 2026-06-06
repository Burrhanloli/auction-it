import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m } from "motion/react";

import { ImageViewer } from "#/components/image-viewer";

export function SoldState({ auction, activePlayer, categoryName, state }: any) {
  return (
    <m.div
      key="sold"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex w-full flex-col items-center gap-y-4 text-center"
    >
      <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        <Confetti
          className="absolute size-full"
          options={{
            particleCount: 150,
            spread: 70,
            angle: 60,
            origin: { x: 0, y: 0.6 },
          }}
        />
        <Confetti
          className="absolute size-full"
          options={{
            particleCount: 150,
            spread: 70,
            angle: 120,
            origin: { x: 1, y: 0.6 },
          }}
        />
      </div>
      <div className="relative">
        <m.span
          initial={{ scale: 3, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className="inline-flex items-center rounded-none border border-white bg-white px-4 py-1.5 text-sm font-black tracking-[1.5px] text-black uppercase"
        >
          🔨 SOLD CELEBRATION 🔨
        </m.span>
      </div>

      {activePlayer.imageUrl ? (
        <LazyImage
          src={activePlayer.imageUrl}
          alt={activePlayer.name}
          priority
          fallbackText={activePlayer.name}
          className="mt-2 h-56 w-40 rounded-none border border-white bg-neutral-950 object-contain"
        />
      ) : (
        <div className="flex h-56 w-40 items-center justify-center rounded-none border border-white bg-neutral-950 text-2xl font-black text-white uppercase">
          {activePlayer.name.slice(0, 2)}
        </div>
      )}

      <div>
        <h2 className="text-4xl font-black text-white">{activePlayer.name}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
          Joined the ranks of{" "}
          <span className="font-bold text-white">{state.currentHighestBidderTeam?.name}</span> for a
          spectacular sum of:
        </p>
      </div>

      <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 px-8 py-4">
        <span className="block text-[10px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
          Sold Price
        </span>
        <span className="text-4xl font-black text-white">{state.currentBidPoints} pts</span>
      </div>
    </m.div>
  );
}
