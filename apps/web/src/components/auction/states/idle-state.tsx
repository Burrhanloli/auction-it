import { Confetti } from "@repo/ui/components/confetti";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { FlameIcon, Volume2Icon, ClockIcon } from "lucide-react";
import { m } from "motion/react";

import { ImageViewer } from "#/components/image-viewer";

export function IdleState({ auction, activePlayer, categoryName, state }: any) {
  return (
    <m.div
      key="idle"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="gap-y- flex w-full flex-col items-center text-center"
    >
      <div className="relative flex size-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-white">
        <span className="pointer-events-none absolute inset-0 animate-ping rounded-none border border-[#3c3c3c]" />
        <ClockIcon className="size-8 animate-pulse text-white" />
      </div>

      <div>
        <h3 className="mb-2 text-xl font-black text-white">Arena Connection Active</h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#bbbbbb]">
          Waiting for the Auctioneer to draw the next player roster card from the selection deck…
        </p>
      </div>
    </m.div>
  );
}
