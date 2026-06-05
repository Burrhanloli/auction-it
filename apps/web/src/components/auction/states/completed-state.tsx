import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";

import { Logo } from "#/components/logo";

export function CompletedState() {
  return (
    <div className="gap-y- mx-auto flex w-full max-w-6xl flex-col">
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-12 text-center">
        <Logo className="mb-4 size-16" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h2 className="mb-2 text-3xl font-black tracking-[1.5px] text-white uppercase">
            Auction Event Concluded
          </h2>
        </div>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#bbbbbb]">
          The bidding session has officially ended. All rosters are locked and finalized. You can
          review the historical events in the logs below.
        </p>
      </div>
    </div>
  );
}
