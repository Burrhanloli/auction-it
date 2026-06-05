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

export function HeroBanner({ setShowCreateForm }: { setShowCreateForm: (v: boolean) => void }) {
  const { data: user } = useQuery(authQueryOptions());

  return (
    <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 text-center md:px-8 md:pt-20 md:pb-16">
      <div className="mb-6 inline-flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1">
        <ActivityIcon className="size-4 text-white" />
        <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
          Real-Time State Synchronization Enabled
        </span>
      </div>
      <div className="mx-auto mb-8 inline-flex max-w-7xl flex-col">
        <MStripeDivider className="mb-4 w-full" />
        <h1 className="text-4xl leading-tight font-black tracking-tight text-white uppercase md:text-6xl">
          The Ultimate Premium <span className="text-white">Player Auction</span> Broadcast Hub
        </h1>
      </div>
      <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#bbbbbb]">
        Create, coordinate, and broadcast high-stakes player auctions with zero manual refreshes.
        Full support for Admins, Team Owners, and dynamic Public Viewers.
      </p>

      {/* Action Panel: Viewers vs Owners vs Admins */}
      <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 text-left md:grid-cols-3">
        {/* Card 1: Public Spectator Deck */}
        <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
              <CompassIcon className="size-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Live Viewer Arena</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
              Watch active player bidding wars, scrolling logs ticker, and team stats dynamically
              without page refreshes.
            </p>
          </div>
          <a
            href="#active-auctions"
            className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
          >
            Browse Live Arenas{" "}
            <ChevronRightIcon className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Card 2: Strategy Deck for Owners */}
        <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
              <DollarSignIcon className="size-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Team Strategy Deck</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
              Check remaining budgets, lock in player wishlists, and manage strategy with your
              team's 6-digit passcode.
            </p>
          </div>
          <a
            href="#active-auctions"
            className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
          >
            Access Strategy Deck{" "}
            <ChevronRightIcon className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Card 3: Administrative Control Hub */}
        <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
          <div>
            <div className="mb-5 flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
              <PlusIcon className="size-6" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Create & Manage</h3>
            <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
              Register team owners, set budgets, configure category pools, draw random players, and
              control real-time bids.
            </p>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="inline-flex cursor-pointer items-center text-left text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
            >
              Create New Auction <ChevronRightIcon className="ml-1 size-4" />
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase transition-colors hover:text-white"
            >
              Sign In to Setup <ChevronRightIcon className="ml-1 size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
