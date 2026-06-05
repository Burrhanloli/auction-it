import { Link } from "@tanstack/react-router";
import {
  CalendarIcon,
  PlayCircleIcon,
  FileEditIcon,
  ChevronRightIcon,
  GavelIcon,
  UsersIcon,
  CoinsIcon,
} from "lucide-react";

export function AuctionCard({
  auction,
  badge,
}: {
  auction: any;
  badge: "live" | "draft" | "completed";
}) {
  const isLive = badge === "live";
  const isCompleted = badge === "completed";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white">
      <div className="p-6">
        {/* Badge + Date */}
        <div className="mb-4 flex items-center justify-between">
          {isLive ? (
            <span className="inline-flex items-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              <span className="size-1.5 rounded-full bg-[#0fa336]" />
              <span>Live</span>
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              <span className="text-[10px]">🏆</span>
              <span>Completed</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              <FileEditIcon className="size-3" />
              <span>Draft</span>
            </span>
          )}
          <span className="flex items-center text-xs text-[#bbbbbb]">
            <CalendarIcon className="mr-1 size-3.5" />
            {new Date(auction.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-black text-white uppercase">{auction.name}</h3>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-3">
            <span className="block text-[10px] font-bold tracking-widest text-[#bbbbbb] uppercase">
              Budget / Team
            </span>
            <span className="mt-1 flex items-center gap-1 text-sm font-black text-white">
              <CoinsIcon className="size-3.5 text-white" />
              {auction.budgetPerTeam} pts
            </span>
          </div>
          <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-3">
            <span className="block text-[10px] font-bold tracking-widest text-[#bbbbbb] uppercase">
              Slug
            </span>
            <span className="mt-1 block truncate font-mono text-xs font-bold text-[#bbbbbb]">
              {auction.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="border-t border-[#3c3c3c] bg-[#1a1a1a] px-6 py-4">
        {isLive || isCompleted ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/admin/$auctionId/control"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <GavelIcon className="size-3.5" />
              <span>Control Panel</span>
            </Link>
            <Link
              to="/auction/$auctionId/live"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <PlayCircleIcon className="size-3.5 text-white" />
              <span>Public Arena</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/admin/$auctionId/setup"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <FileEditIcon className="size-3.5 text-[#bbbbbb]" />
              <span>Setup</span>
            </Link>
            <Link
              to="/admin/$auctionId/teams"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <UsersIcon className="size-3.5 text-[#bbbbbb]" />
              <span>Teams</span>
            </Link>
            <Link
              to="/admin/$auctionId/control"
              params={{ auctionId: auction.slug }}
              className="col-span-2 flex items-center justify-center gap-x-1.5 rounded-none border border-white bg-transparent py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-all hover:bg-white hover:text-black"
            >
              <GavelIcon className="size-3.5" />
              <span>Go to Control Panel</span>
              <ChevronRightIcon className="size-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
