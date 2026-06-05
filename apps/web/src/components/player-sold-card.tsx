import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon, HammerIcon } from "lucide-react";
import React from "react";

import { Logo } from "#/components/logo";

interface Player {
  id: string;
  name: string;
  skills: string;
  imageUrl?: string | null;
  status: "unsold" | "sold" | "captain";
  soldPoints?: number | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    basePoints: number;
  } | null;
}

interface Team {
  id: string;
  name: string;
  logoUrl?: string | null;
  ownerName: string;
  ownerImageUrl?: string | null;
}

interface Auction {
  id: string;
  name: string;
  logoUrl?: string | null;
}

interface PlayerSoldCardProps {
  player: Player;
  team: Team;
  auction: Auction;
  ref?: React.Ref<HTMLDivElement>;
}

export function PlayerSoldCard({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 font-sans text-white select-none"
    >
      {/* Decorative background grids/details to make it look premium */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black" />

      {/* Technical crosshair lines in corner for sporty tech aesthetic */}
      <div className="pointer-events-none absolute top-6 left-6 z-0 size-3 border-t border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute top-6 right-6 z-0 size-3 border-t border-r border-[#3c3c3c]" />
      <div className="pointer-events-none absolute bottom-6 left-6 z-0 size-3 border-b border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute right-6 bottom-6 z-0 size-3 border-r border-b border-[#3c3c3c]" />

      {/* 1. HEADER - Auction Branding */}
      <div className="relative z-10 flex h-40 shrink-0 items-center justify-between border-b border-[#3c3c3c] bg-neutral-950/80 px-8 backdrop-blur-md">
        {/* Left: Auction Branding with Logo */}
        <div className="flex items-center gap-5">
          <Logo
            src={auction.logoUrl}
            className="size-28 shrink-0 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain p-2"
            iconClassName="size-14"
          />
          <div className="flex flex-col">
            <span className="mb-1 text-[11px] leading-none font-bold tracking-[2px] text-[#7e7e7e] uppercase">
              OFFICIAL AUCTION
            </span>
            <h2 className="text-[28px] leading-none font-black tracking-[1.5px] text-white uppercase">
              {auction.name}
            </h2>
          </div>
        </div>

        {/* Right: Event Type */}
        <div className="flex items-center gap-5 text-right">
          <div className="flex flex-col">
            <span className="mb-1 text-[11px] leading-none font-bold tracking-[2px] text-m-blue-light uppercase">
              ACQUISITION CONFIRMED
            </span>
            <h2 className="text-title-sm leading-none font-extrabold tracking-[1px] text-white uppercase">
              PLAYER SOLD
            </h2>
          </div>
          <div className="flex size-20 shrink-0 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-900 text-white">
            <HammerIcon className="size-10 text-m-blue-light" />
          </div>
        </div>

        {/* BMW M-Stripe Divider underneath the header */}
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      </div>

      {/* 2. BODY CONTENT */}
      <div className="z-10 flex min-h-0 flex-1 flex-col items-center justify-center p-8">
        <div className="relative flex w-full max-w-5xl flex-col items-center">
          {/* Player Photo Frame */}
          <div className="relative flex aspect-square w-96 shrink-0 items-center justify-center overflow-hidden border-2 border-[#3c3c3c] bg-neutral-900 shadow-2xl">
            {player.imageUrl ? (
              <LazyImage
                src={player.imageUrl}
                alt={player.name}
                priority
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-neutral-900 to-black text-neutral-600 uppercase">
                <StarIcon className="mb-2 size-24 text-neutral-800" />
                <span className="text-xl font-bold tracking-[1.5px]">Photo Pending</span>
              </div>
            )}

            {/* Double bottom-border styling inside photo */}
            <div className="absolute right-0 bottom-0 left-0 h-2 bg-m-blue-light" />
          </div>

          {/* Player Name and Skills */}
          <div className="mt-8 flex w-full flex-col items-center justify-center px-4 text-center">
            <span className="mb-2 inline-flex shrink-0 items-center rounded-none border border-[#3c3c3c] bg-neutral-900 px-4 py-1.5 text-body-sm font-black tracking-[2.5px] text-white uppercase shadow-lg">
              {player.category?.name || "UNASSIGNED CATEGORY"}
            </span>
            <h1 className="line-clamp-2 text-[60px] leading-[1.1] font-black tracking-[2px] text-balance text-white uppercase">
              {player.name}
            </h1>
            <span className="mt-3 line-clamp-2 text-[22px] leading-tight font-light tracking-[3px] text-balance text-[#bbbbbb] uppercase">
              {player.skills}
            </span>
          </div>
        </div>
      </div>

      {/* 3. SOLD BANNERS & FOOTER (Team Details) */}
      <div className="relative z-10 flex shrink-0 flex-col">
        {/* Action Accent - The Sold Price Strip */}
        <div className="flex h-28 items-center justify-center bg-white px-8 text-black shadow-[0_-10px_40px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-6">
            <span className="text-title-lg font-bold tracking-[4px] uppercase">SOLD FOR</span>
            <span className="text-[64px] leading-none font-black tracking-[1px]">
              {player.soldPoints?.toLocaleString() || 0}
            </span>
            <span className="text-title-lg font-bold tracking-[4px] uppercase">POINTS</span>
          </div>
        </div>

        {/* Footer - Team Info */}
        <div className="flex h-48 items-center justify-center border-t-2 border-[#3c3c3c] bg-neutral-950 px-8">
          <div className="flex items-center gap-8">
            <div className="flex flex-col text-right">
              <span className="mb-2 text-body-sm leading-none font-bold tracking-[3px] text-[#7e7e7e] uppercase">
                ACQUIRED BY
              </span>
              <h3 className="text-display-md leading-none font-black tracking-[1.5px] text-white uppercase">
                {team.name}
              </h3>
            </div>

            {/* Team Logo */}
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-32 shrink-0 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain p-2"
              />
            ) : (
              <div className="flex size-32 shrink-0 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-900 text-[36px] font-bold text-white uppercase">
                {team.name.slice(0, 2)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
