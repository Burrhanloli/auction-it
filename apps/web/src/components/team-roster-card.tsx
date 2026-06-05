import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon } from "lucide-react";
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
  totalBudget: number;
  remainingBudget: number;
  captainPlayer?: Player | null;
}

interface Auction {
  id: string;
  name: string;
  logoUrl?: string | null;
  budgetPerTeam: number;
}

interface TeamRosterCardProps {
  team: Team;
  players: Player[];
  categories: Array<{ id: string; name: string }>;
  auction: Auction;
  ref?: React.Ref<HTMLDivElement>;
}

export function TeamRosterCard({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  // Identify the captain player
  const captain = team.captainPlayer || players.find((p) => p.status === "captain");
  const captainName = captain?.name ?? "NO CAPTAIN ASSIGNED";

  // 1. Filter out the captain so they aren't duplicated on the right column
  const nonCaptainPlayers = players.filter((p) => p.id !== captain?.id);

  // 2. Group remaining players by category
  const categoryMap = new Map<string, Player[]>();

  // Sort players by soldPoints desc, then by name
  // @ts-ignore - toSorted is an ES2023 feature not yet in TS lib
  const sortedPlayers = nonCaptainPlayers.toSorted((a: any, b: any) => {
    const pointsA = a.soldPoints ?? 0;
    const pointsB = b.soldPoints ?? 0;
    if (pointsB !== pointsA) return pointsB - pointsA;
    return a.name.localeCompare(b.name);
  });

  for (const player of sortedPlayers) {
    const catId = player.categoryId;
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, []);
    }
    categoryMap.get(catId)!.push(player);
  }

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1350px" }}
      className="relative flex shrink-0 flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 font-sans text-white select-none"
    >
      {/* Decorative background grids/details to make it look premium */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black" />

      {/* Technical crosshair lines in corner for sporty tech aesthetic */}
      <div className="pointer-events-none absolute top-6 left-6 z-0 size-3 border-t border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute top-6 right-6 z-0 size-3 border-t border-r border-[#3c3c3c]" />
      <div className="pointer-events-none absolute bottom-6 left-6 z-0 size-3 border-b border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute right-6 bottom-6 z-0 size-3 border-r border-b border-[#3c3c3c]" />

      {/* 1. HEADER */}
      <div className="relative z-10 flex h-40 shrink-0 items-center justify-between border-b border-[#3c3c3c] bg-neutral-950/80 px-8 backdrop-blur-md">
        {/* Left: Team Branding */}
        <div className="flex items-center gap-5">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-32 shrink-0 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain p-2"
            />
          ) : (
            <div className="flex size-32 shrink-0 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-900 text-2xl font-bold text-white uppercase">
              {team.name.slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="mb-1 text-[11px] leading-none font-bold tracking-[2px] text-[#7e7e7e] uppercase">
              TEAM SQUAD ROSTER
            </span>
            <h1 className="text-[28px] leading-none font-black tracking-[1.5px] text-white uppercase">
              {team.name}
            </h1>
          </div>
        </div>

        {/* Right: Auction Branding with Logo */}
        <div className="flex items-center gap-5 text-right">
          <div className="flex flex-col">
            <span className="mb-1 text-[11px] leading-none font-bold tracking-[2px] text-[#7e7e7e] uppercase">
              OFFICIAL PARTNER
            </span>
            <h2 className="text-title-sm leading-none font-extrabold tracking-[1px] text-white uppercase">
              {auction.name}
            </h2>
          </div>
          <Logo
            src={auction.logoUrl}
            className="size-28 shrink-0 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain p-2"
            iconClassName="size-14"
          />
        </div>

        {/* BMW M-Stripe Divider underneath the header */}
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      </div>

      {/* 2. BODY CONTENT */}
      <div className="z-10 flex min-h-0 flex-1">
        {/* COLUMN A: Captain Spotlight (40% width) */}
        <div className="flex w-105 shrink-0 flex-col justify-between border-r border-[#3c3c3c] bg-neutral-950/30 p-8">
          {/* Captain Spotlight Header */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-0.5 w-8 bg-m-red" />
              <span className="text-caption font-bold tracking-[2.5px] text-white uppercase">
                TEAM SPOTLIGHT
              </span>
            </div>

            {/* Captain Photo Frame */}
            <div className="relative flex aspect-3/4 w-full items-center justify-center overflow-hidden border border-[#3c3c3c] bg-neutral-900">
              {captain?.imageUrl ? (
                <LazyImage
                  src={captain.imageUrl}
                  alt={captainName}
                  priority
                  className="absolute inset-0 size-full object-contain"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-neutral-900 to-black text-neutral-600 uppercase">
                  <StarIcon className="mb-2 size-16 text-neutral-800" />
                  <span className="text-caption font-bold tracking-[1.5px]">Photo Pending</span>
                </div>
              )}

              {/* Double bottom-border styling inside photo */}
              <div className="absolute right-0 bottom-0 left-0 h-1.5 bg-m-red" />
            </div>
          </div>

          {/* Captain Info Details */}
          <div className="mt-6 flex flex-col gap-3">
            <span className="text-[10px] leading-none font-bold tracking-[3px] text-[#7e7e7e] uppercase">
              {captain ? "TEAM LEADER" : "LEADER DESIGNATION"}
            </span>
            <h3 className="line-clamp-2 text-display-sm leading-none font-black tracking-[1px] text-white uppercase">
              {captainName}
            </h3>

            {captain ? (
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center rounded-none border border-white bg-white px-3 py-1 text-[11px] font-black tracking-[2px] text-black uppercase shadow-lg">
                  ★ CAPTAIN
                </span>
              </div>
            ) : (
              <div className="mt-1 flex">
                <span className="inline-flex items-center rounded-none border border-dashed border-[#3c3c3c] px-3 py-1 text-[11px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                  UNASSIGNED
                </span>
              </div>
            )}

            {/* Owner Info block */}
            <div className="mt-2 flex flex-col gap-1 border-t border-[#3c3c3c] pt-4">
              <span className="text-[10px] leading-none font-bold tracking-[2.5px] text-[#7e7e7e] uppercase">
                OWNERSHIP
              </span>
              <span className="text-[15px] leading-none font-bold text-[#bbbbbb] uppercase">
                {team.ownerName || "TBD"}
              </span>
            </div>
          </div>
        </div>

        {/* COLUMN B: Squad by Category (60% width) */}
        <div className="flex flex-1 flex-col overflow-hidden bg-neutral-950 p-4">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-8 bg-m-blue-light" />
              <span className="text-caption font-bold tracking-[2.5px] text-white uppercase">
                SQUAD SESSIONS
              </span>
            </div>
            <span className="text-[11px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
              {players.length} TOTAL PLAYERS
            </span>
          </div>

          {/* List of categories scrollable/scalable container */}
          <div className="flex flex-1 scrollbar-none flex-col gap-2 overflow-hidden pr-1">
            {categories.map((category) => {
              const categoryPlayers = categoryMap.get(category.id) || [];
              if (categoryPlayers.length === 0) return null;

              return (
                <div
                  key={category.id}
                  className="relative flex flex-col gap-2 rounded-none border border-[#3c3c3c] bg-neutral-950/40 p-3"
                >
                  {/* Tiny M-stripe accent in category header */}
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-m-blue-dark" />

                  {/* Category Title */}
                  <div className="flex items-center justify-between border-b border-[#3c3c3c]/60 pb-2 pl-2">
                    <span className="text-[13px] font-black tracking-[2px] text-white uppercase">
                      {category.name}
                    </span>
                    <span className="text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                      {categoryPlayers.length} {categoryPlayers.length === 1 ? "player" : "players"}
                    </span>
                  </div>

                  {/* Category Players List */}
                  <div className="grid grid-cols-2 gap-2 pl-2">
                    {categoryPlayers.map((player) => {
                      const isCaptainPlayer = player.status === "captain";

                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between border p-1.5 ${
                            isCaptainPlayer
                              ? "border-white bg-white/5"
                              : "border-neutral-800 bg-neutral-950/60"
                          } rounded-none transition-all hover:border-[#7e7e7e]`}
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            {/* Player image or fallback */}
                            <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden border border-[#3c3c3c] bg-neutral-900">
                              {player.imageUrl ? (
                                <LazyImage
                                  src={player.imageUrl}
                                  alt={player.name}
                                  priority
                                  className="size-full object-contain"
                                />
                              ) : (
                                <span className="text-sm font-extrabold text-white uppercase">
                                  {player.name.slice(0, 2)}
                                </span>
                              )}
                              {isCaptainPlayer && (
                                <div
                                  className="absolute top-0 right-0 size-3 rounded-full border border-black bg-m-red"
                                  title="Captain"
                                />
                              )}
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span
                                className="line-clamp-2 text-sm leading-tight font-bold text-balance text-white uppercase"
                                title={player.name}
                              >
                                {player.name}
                              </span>
                              <span className="line-clamp-1 text-[10px] leading-none font-light text-[#bbbbbb] uppercase">
                                {player.skills}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Handle empty squad state */}
            {players.length === 0 && (
              <div className="flex flex-1 flex-col items-center justify-center rounded-none border border-dashed border-[#3c3c3c] p-8 text-center text-neutral-500 uppercase">
                <span className="mb-1 text-caption font-bold tracking-[2px]">
                  No Players Acquired
                </span>
                <span className="text-[10px] font-light text-[#bbbbbb]/60">
                  Squad is currently empty.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. FOOTER STATS */}
      <div className="relative z-10 flex h-22.5 shrink-0 items-center border-t border-[#3c3c3c] bg-neutral-950 px-8">
        <div className="grid w-full grid-cols-2 gap-6 text-center">
          {/* Squad Count */}
          <div className="flex flex-col items-center justify-center border-r border-[#3c3c3c]">
            <span className="mb-1 text-[10px] font-bold tracking-[2.5px] text-[#7e7e7e] uppercase">
              SQUAD CAPACITY
            </span>
            <span className="text-[22px] font-black tracking-[1px] text-white uppercase">
              {players.length}{" "}
              <span className="text-[13px] font-bold text-[#bbbbbb]">PLAYERS REGISTERED</span>
            </span>
          </div>

          {/* Roster Confirmation */}
          <div className="flex flex-col items-center justify-center">
            <span className="mb-1 text-[10px] font-bold tracking-[2.5px] text-m-blue-light uppercase">
              ROSTER STATUS
            </span>
            <span className="text-[22px] font-black tracking-[1px] text-white uppercase">
              OFFICIAL SQUAD
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
