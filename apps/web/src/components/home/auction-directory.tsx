import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  TrophyIcon,
  PlayIcon,
  ShieldAlertIcon,
  PlusIcon,
  UserIcon,
  CompassIcon,
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  ActivityIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { $getAllAuctions, $createAuction } from "#/lib/auction-actions";

export function AuctionDirectory({
  setShowCreateForm,
}: {
  setShowCreateForm: (v: boolean) => void;
}) {
  const { data: user } = useQuery(authQueryOptions());
  const { data: auctionsData, isLoading } = useQuery({
    queryKey: ["auctions", "active", "index"],
    queryFn: () => $getAllAuctions({ data: { status: "active", limit: 11 } }),
  });

  const auctions = auctionsData?.slice(0, 10);
  const hasMoreAuctions = (auctionsData?.length || 0) > 10;

  return (
    <main
      id="active-auctions"
      className="relative z-10 mx-auto max-w-7xl border-t border-[#3c3c3c] px-4 py-16 md:px-8 md:py-20"
    >
      <div className="mb-10 flex flex-col justify-between md:flex-row md:items-center">
        <div>
          <div className="inline-flex flex-col">
            <MStripeDivider className="mb-2 w-full" />
            <h2 className="flex items-center text-2xl font-black text-white uppercase">
              <PlayIcon className="mr-2 size-5 text-white" />
              Active Auction Events
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Select an active event from our live dashboard database below
          </p>
        </div>

        {user && (
          <Button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black md:mt-0"
          >
            <PlusIcon className="mr-2 size-4" />
            Setup New Arena
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-[#bbbbbb]">Loading live database events…</p>
        </div>
      ) : !auctions || auctions.length === 0 ? (
        <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-16 text-center">
          <ShieldAlertIcon className="mx-auto mb-4 size-12 text-white" />
          <h3 className="mb-2 text-lg font-bold text-white uppercase">
            No Active Arenas Registered
          </h3>
          <p className="mx-auto mb-6 max-w-md text-sm text-[#bbbbbb]">
            Create your very first Player Auction event to start inviting team owners and public
            audiences.
          </p>
          {user ? (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
            >
              Launch First Arena
            </Button>
          ) : (
            <Link to="/signup">
              <Button className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
                Register as Admin
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {auctions.map((auc) => (
              <div
                key={auc.id}
                className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white"
              >
                <div className="p-8">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="inline-flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      <span className="size-1.5 rounded-full bg-[#0fa336]" />
                      <span>{auc.status}</span>
                    </div>
                    <span className="flex items-center text-[10px] text-[#bbbbbb]">
                      <CalendarIcon className="mr-1 size-3.5" />
                      {new Date(auc.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold text-white uppercase">{auc.name}</h3>

                  <div className="mt-4 flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5 text-xs text-[#bbbbbb]">
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

                <div className="grid grid-cols-1 gap-3 border-t border-[#3c3c3c] bg-[#1a1a1a] px-8 py-5 sm:grid-cols-3">
                  {auc.status !== "draft" ? (
                    <>
                      <Link
                        to="/auction/$auctionId/live"
                        params={{ auctionId: auc.slug! }}
                        className="flex items-center justify-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                      >
                        <span>Arena</span>
                      </Link>

                      <Link
                        to="/auction/$auctionId/leaderboard"
                        params={{ auctionId: auc.slug! }}
                        className="flex items-center justify-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                      >
                        <span>Stats</span>
                      </Link>
                    </>
                  ) : (
                    <div className="col-span-2 flex items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                      <span>Draft Mode (Locked)</span>
                    </div>
                  )}

                  <Link
                    to="/team/$auctionId"
                    params={{ auctionId: auc.slug! }}
                    className="flex items-center justify-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                  >
                    <span>Strategy</span>
                  </Link>

                  {user && auc.userId === user.id && (
                    <Link
                      to="/admin/$auctionId/control"
                      params={{ auctionId: auc.slug! }}
                      className="col-span-3 mt-2 flex items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 py-1.5 text-center text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase transition-all hover:bg-white hover:text-black"
                    >
                      <span>Go To Panel 🔧</span>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hasMoreAuctions && (
            <div className="mt-12 flex justify-center">
              <Link to="/auctions">
                <Button className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-8 py-6 font-bold tracking-[1.5px] text-white uppercase transition-colors hover:border-white hover:bg-white hover:text-black">
                  View All Active Arenas
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </main>
  );
}
