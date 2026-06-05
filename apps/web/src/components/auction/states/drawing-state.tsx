import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m } from "motion/react";

import { ImageViewer } from "#/components/image-viewer";

export function DrawingState({ auction, activePlayer, categoryName, state }: any) {
  return (
    <m.div
      key="drawing"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="gap-y- flex w-full flex-col items-center text-center"
    >
      <div className="relative flex size-32 items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 text-5xl font-black text-[#bbbbbb]">
        <m.div
          animate={{ y: [0, -400] }}
          transition={{
            repeat: Infinity,
            duration: 0.5,
            ease: "linear",
          }}
          className="gap-y- flex flex-col items-center"
        >
          <span>?</span>
          <span>?</span>
          <span>?</span>
          <span>?</span>
          <span>?</span>
          <span>?</span>
          <span>?</span>
          <span>?</span>
        </m.div>
      </div>
      <div>
        <h2 className="mb-2 text-2xl font-black tracking-[1.5px] text-white uppercase">
          Drawing Player…
        </h2>
        <p className="text-sm text-[#bbbbbb]">The auctioneer is shuffling the deck</p>
      </div>
    </m.div>
  );
}
