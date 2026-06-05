import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TrophyIcon, ShieldAlertIcon, CalendarIcon, SearchIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { $getAllAuctions } from "#/lib/auction-actions";

// Define search parameters for the route
const searchSchema = z.object({
  status: z.enum(["active", "completed"]).optional().default("active"),
  q: z.string().optional().catch(""),
});

export const Route = createFileRoute("/auctions/")({
  validateSearch: searchSchema,
  component: AuctionsPage,
});

function AuctionsPage() {
  const { status, q } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data: user } = useQuery(authQueryOptions());

  const [searchInput, setSearchInput] = useState(q || "");

  const { data: auctions, isLoading } = useQuery({
    queryKey: ["auctions", status, q],
    queryFn: () => $getAllAuctions({ data: { status, search: q } }),
  });

  return (
    <div className="relative min-h-screen bg-neutral-950 font-sans text-white">
      {/* Header bar */}
      <header className="relative sticky top-0 z-40 border-b border-[#3c3c3c] bg-neutral-950 px-4 py-4 md:px-8 md:py-5">
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link to="/" className="flex items-center gap-x-3">
            <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
              <TrophyIcon className="size-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-x-4">
            {user ? (
              <div className="flex items-center gap-x-3">
                <div className="flex hidden items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1.5 md:flex">
                  <UserIcon className="size-4 text-white" />
                  <span className="text-sm font-medium text-[#bbbbbb]">{user.name}</span>
                </div>
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-none tracking-[1.5px] text-[#bbbbbb] uppercase hover:text-white"
                >
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-10 text-center">
          <div className="inline-flex flex-col">
            <MStripeDivider className="mb-2 w-full" />
            <h1 className="text-4xl font-black tracking-tight text-white uppercase md:text-5xl">
              Arena Directory
            </h1>
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-[#bbbbbb]">
            Browse active bidding wars or explore completed auctions to view final squad rosters and
            player prices.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 border border-[#3c3c3c] bg-[#1a1a1a] p-4 md:flex-row">
          {/* react-doctor-disable-next-line react-doctor/no-prevent-default */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ search: { status, q: searchInput } });
            }}
            className="flex w-full max-w-md items-center gap-x-2"
          >
            <div className="relative w-full">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search arenas by name…"
                className="w-full rounded-none border-[#3c3c3c] bg-neutral-950 pl-10 text-white placeholder:text-slate-500 focus:border-white"
              />
            </div>
            <Button
              type="submit"
              className="rounded-none border border-[#3c3c3c] bg-neutral-950 tracking-[1.5px] text-white uppercase hover:border-white hover:bg-white hover:text-black"
            >
              Search
            </Button>
          </form>

          <div className="flex items-center gap-x-6 border-b border-[#3c3c3c]">
            <button
              type="button"
              onClick={() => navigate({ search: { status: "active", q } })}
              className={`group relative py-3 text-body-sm font-bold tracking-[1.5px] uppercase transition-colors ${status === "active" ? "text-white" : "text-[#bbbbbb] hover:text-white"}`}
            >
              Active
              {status === "active" && (
                <div className="absolute right-0 -bottom-px left-0 h-0.5 bg-white" />
              )}
              {status !== "active" && (
                <MStripeDivider className="absolute right-0 -bottom-px left-0 hidden group-hover:block" />
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate({ search: { status: "completed", q } })}
              className={`group relative py-3 text-body-sm font-bold tracking-[1.5px] uppercase transition-colors ${status === "completed" ? "text-white" : "text-[#bbbbbb] hover:text-white"}`}
            >
              Completed
              {status === "completed" && (
                <div className="absolute right-0 -bottom-px left-0 h-0.5 bg-white" />
              )}
              {status !== "completed" && (
                <MStripeDivider className="absolute right-0 -bottom-px left-0 hidden group-hover:block" />
              )}
            </button>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-[#bbbbbb]">Loading arenas…</p>
          </div>
        ) : !auctions || auctions.length === 0 ? (
          <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-16 text-center">
            <ShieldAlertIcon className="mx-auto mb-4 size-12 text-[#bbbbbb]" />
            <h3 className="mb-2 text-lg font-bold text-white uppercase">No Arenas Found</h3>
            <p className="mx-auto max-w-md text-sm text-[#bbbbbb]">
              We couldn't find any {status} arenas matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auc) => (
              <div
                key={auc.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white"
              >
                <div className="p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      <span
                        className={`size-1.5 rounded-full ${auc.status === "active" ? "bg-[#0fa336]" : "bg-[#a30f0f]"}`}
                      />
                      <span>{auc.status}</span>
                    </div>
                    <span className="flex items-center text-[10px] text-[#bbbbbb]">
                      <CalendarIcon className="mr-1 size-3.5" />
                      {new Date(auc.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white uppercase">{auc.name}</h3>

                  <div className="mt-4 flex items-center gap-x-4 rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5 text-xs text-[#bbbbbb]">
                    <div>
                      <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Point Budget
                      </span>
                      <span className="font-bold text-white">{auc.budgetPerTeam} pts</span>
                    </div>
                    <div className="h-6 border-l border-[#3c3c3c]" />
                    <div>
                      <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Unique Key
                      </span>
                      <span className="block max-w-30 truncate font-mono text-[9px] text-[#bbbbbb]">
                        {auc.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 border-t border-[#3c3c3c] bg-[#1a1a1a] px-8 py-5 sm:grid-cols-2">
                  <Link
                    to="/auction/$auctionId/live"
                    params={{ auctionId: auc.slug! }}
                    className="flex items-center justify-center gap-x-1 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                  >
                    <span>Arena</span>
                  </Link>

                  <Link
                    to="/auction/$auctionId/leaderboard"
                    params={{ auctionId: auc.slug! }}
                    className="flex items-center justify-center gap-x-1 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                  >
                    <span>Stats</span>
                  </Link>

                  <Link
                    to="/team/$auctionId"
                    params={{ auctionId: auc.slug! }}
                    className="col-span-2 flex items-center justify-center gap-x-1 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                  >
                    <span>Team Strategy</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
