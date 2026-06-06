import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m } from "motion/react";

import { ImageViewer } from "#/components/image-viewer";

export function UnsoldState({ auction, activePlayer, categoryName, state }: any) {
  return (
    <m.div
      key="unsold"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex w-full flex-col items-center gap-y-4 text-center"
    >
      <span className="inline-flex items-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-1.5 text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
        💨 UNSOLD 💨
      </span>

      {activePlayer.imageUrl ? (
        <LazyImage
          src={activePlayer.imageUrl}
          alt={activePlayer.name}
          priority
          fallbackText={activePlayer.name}
          className="mt-2 h-56 w-40 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain opacity-50"
        />
      ) : (
        <div className="flex h-56 w-40 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-2xl font-black text-[#bbbbbb] uppercase">
          {activePlayer.name.slice(0, 2)}
        </div>
      )}

      <div>
        <h2 className="text-3xl font-black text-white">{activePlayer.name}</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
          This player went unsold in this round and returns to the backup selection pool.
        </p>
      </div>
    </m.div>
  );
}
