import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon } from "lucide-react";

import { Logo } from "#/components/logo";

export function LiveHeader({
  scrollDirection,
  auctionId,
}: {
  scrollDirection: string;
  auctionId: string;
}) {
  return (
    <header
      className={`relative sticky top-0 z-40 flex flex-col justify-between gap-4 border-b border-[#3c3c3c] bg-neutral-950 px-4 py-4 transition-transform duration-300 ease-in-out md:flex-row md:items-center md:gap-0 md:px-8 md:py-5 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      <div className="flex items-center gap-x-2">
        <Link to="/">
          <button
            type="button"
            className="flex size-9 cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] hover:bg-white hover:text-black"
          >
            <ArrowLeftIcon className="size-4" />
          </button>
        </Link>
        <div className="flex items-center gap-x-2">
          <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
            <Logo className="size-[18px]" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-[1.5px] text-white uppercase">
              AUCTION-IT
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-x-2">
        <Link to="/auction/$auctionId/leaderboard" params={{ auctionId }}>
          <button
            type="button"
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-2 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
          >
            Leaderboard Stats
          </button>
        </Link>
      </div>
    </header>
  );
}
