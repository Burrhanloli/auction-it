import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { TrophyIcon } from "lucide-react";

import { Logo } from "#/components/logo";

export function AuctionHero({
  auction,
  subtitle,
}: {
  auction: { name: string; logoUrl: string | null };
  subtitle: string;
}) {
  return (
    <div className="relative w-full overflow-hidden bg-black px-4 py-16 md:px-8">
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-end opacity-10">
        <Logo
          src={auction.logoUrl}
          className="h-[200%] w-[200%] object-cover object-bottom-right opacity-50 mix-blend-screen blur-sm md:h-[150%] md:w-[150%]"
          iconClassName="h-96 w-96 translate-x-1/4 -translate-y-1/4 blur-[2px]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-6 flex h-16 w-16 items-center justify-center overflow-hidden border border-[#3c3c3c] bg-[#1a1a1a] p-2">
          <Logo src={auction.logoUrl} className="h-full w-full" iconClassName="h-8 w-8" />
        </div>

        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-4 w-full" />
          <h1 className="mb-4 text-4xl leading-tight font-black tracking-tight text-white uppercase md:text-display-lg md:leading-[1.05]">
            {auction.name}
          </h1>
        </div>
        <p className="text-base font-light text-[#bbbbbb] md:text-body-md">{subtitle}</p>
      </div>
    </div>
  );
}
