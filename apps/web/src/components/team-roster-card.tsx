import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon, ZapIcon, ShieldIcon, CrownIcon } from "lucide-react";
import React from "react";

import { Logo } from "#/components/logo";

export type CardVariant = "default" | "minimal" | "cyberpunk" | "trading-card" | "elegant";

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

export interface TeamRosterCardProps {
  team: Team;
  players: Player[];
  categories: Array<{ id: string; name: string }>;
  auction: Auction;
  variant?: CardVariant;
  ref?: React.Ref<HTMLDivElement>;
}

// Helper to prepare data for most variants that need categorization
function useRosterData(team: Team, players: Player[]) {
  const captain = team.captainPlayer || players.find((p) => p.status === "captain");
  const nonCaptainPlayers = players.filter((p) => p.id !== captain?.id);
  const categoryMap = new Map<string, Player[]>();

  // @ts-ignore - toSorted is an ES2023 feature
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

  return { captain, categoryMap };
}

// 1. DEFAULT VARIANT
function TeamRosterCardDefault({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);
  const captainName = captain?.name ?? "NO CAPTAIN ASSIGNED";

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 font-sans text-white select-none"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black" />

      <div className="pointer-events-none absolute top-6 left-6 z-0 size-3 border-t border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute top-6 right-6 z-0 size-3 border-t border-r border-[#3c3c3c]" />
      <div className="pointer-events-none absolute bottom-6 left-6 z-0 size-3 border-b border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute right-6 bottom-6 z-0 size-3 border-r border-b border-[#3c3c3c]" />

      <div className="relative z-10 flex h-40 shrink-0 items-center justify-between border-b border-[#3c3c3c] bg-neutral-950/80 px-8 backdrop-blur-md">
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
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      </div>

      <div className="z-10 flex min-h-0 flex-1">
        <div className="flex w-105 shrink-0 flex-col justify-between border-r border-[#3c3c3c] bg-neutral-950/30 p-8">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-0.5 w-8 bg-m-red" />
              <span className="text-caption font-bold tracking-[2.5px] text-white uppercase">
                TEAM SPOTLIGHT
              </span>
            </div>

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
              <div className="absolute right-0 bottom-0 left-0 h-1.5 bg-m-red" />
            </div>
          </div>

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

          <div className="flex flex-1 scrollbar-none flex-col gap-2 overflow-hidden pr-1">
            {categories.map((category) => {
              const categoryPlayers = categoryMap.get(category.id) || [];
              if (categoryPlayers.length === 0) return null;

              return (
                <div
                  key={category.id}
                  className="relative flex flex-col gap-2 rounded-none border border-[#3c3c3c] bg-neutral-950/40 p-3"
                >
                  <div className="absolute top-0 bottom-0 left-0 w-1 bg-m-blue-dark" />

                  <div className="flex items-center justify-between border-b border-[#3c3c3c]/60 pb-2 pl-2">
                    <span className="text-[13px] font-black tracking-[2px] text-white uppercase">
                      {category.name}
                    </span>
                    <span className="text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                      {categoryPlayers.length} {categoryPlayers.length === 1 ? "player" : "players"}
                    </span>
                  </div>

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
                            <div className="relative flex size-18 shrink-0 items-center justify-center overflow-hidden border border-[#3c3c3c] bg-neutral-900">
                              {player.imageUrl ? (
                                <LazyImage
                                  src={player.imageUrl}
                                  alt={player.name}
                                  priority
                                  className="size-full object-contain"
                                />
                              ) : (
                                <span className="text-base font-extrabold text-white uppercase">
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

      <div className="relative z-10 flex h-22.5 shrink-0 items-center border-t border-[#3c3c3c] bg-neutral-950 px-8">
        <div className="grid w-full grid-cols-2 gap-6 text-center">
          <div className="flex flex-col items-center justify-center border-r border-[#3c3c3c]">
            <span className="mb-1 text-[10px] font-bold tracking-[2.5px] text-[#7e7e7e] uppercase">
              SQUAD CAPACITY
            </span>
            <span className="text-[22px] font-black tracking-[1px] text-white uppercase">
              {players.length}{" "}
              <span className="text-[13px] font-bold text-[#bbbbbb]">PLAYERS REGISTERED</span>
            </span>
          </div>
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

// 2. MINIMAL VARIANT
function TeamRosterCardMinimal({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-white p-12 font-sans text-neutral-900 select-none"
    >
      <div className="pointer-events-none absolute inset-0 border-[16px] border-neutral-100" />

      <div className="mb-12 flex items-center justify-between border-b-2 border-neutral-200 pb-8">
        <div className="flex items-center gap-6">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-24 object-contain"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full bg-neutral-100 text-3xl font-bold text-neutral-400 uppercase">
              {team.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1 className="text-4xl font-light tracking-widest uppercase">{team.name}</h1>
            <span className="text-sm font-semibold tracking-widest text-neutral-400 uppercase">
              Official Roster
            </span>
          </div>
        </div>
        <Logo
          src={auction.logoUrl}
          className="size-16 object-contain opacity-60 grayscale"
          iconClassName="size-8"
        />
      </div>

      <div className="flex flex-1 gap-12">
        {/* Left col: Captain & Stats */}
        <div className="flex w-1/3 flex-col">
          <div className="mb-8">
            <span className="mb-4 block border-b border-neutral-200 pb-2 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Captain
            </span>
            {captain ? (
              <div className="flex flex-col items-center">
                <div className="mb-4 size-48 overflow-hidden rounded-full border-4 border-neutral-100 bg-neutral-50 shadow-md">
                  {captain.imageUrl ? (
                    <LazyImage
                      src={captain.imageUrl}
                      alt={captain.name}
                      priority
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-neutral-300">
                      <StarIcon className="size-12" />
                    </div>
                  )}
                </div>
                <h3 className="text-center text-xl font-medium tracking-wider uppercase">
                  {captain.name}
                </h3>
                <span className="mt-1 text-xs tracking-widest text-neutral-500 uppercase">
                  {captain.skills}
                </span>
              </div>
            ) : (
              <div className="text-sm text-neutral-400 italic">No captain assigned.</div>
            )}
          </div>

          <div className="flex-1 rounded-2xl border border-neutral-100 bg-neutral-50 p-6">
            <span className="mb-4 block text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
              Overview
            </span>
            <div className="space-y-4">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-sm text-neutral-500 uppercase">Squad Size</span>
                <span className="font-semibold">{players.length}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-sm text-neutral-500 uppercase">Owner</span>
                <span className="text-right font-semibold">{team.ownerName || "TBD"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right col: Squad */}
        <div className="flex h-full w-2/3 flex-col overflow-hidden">
          <span className="mb-4 block border-b border-neutral-200 pb-2 text-xs font-bold tracking-[0.2em] text-neutral-400 uppercase">
            Team Members
          </span>
          <div className="flex flex-1 scrollbar-none flex-col gap-6">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              return (
                <div key={cat.id}>
                  <h4 className="mb-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase">
                    {cat.name} ({catPlayers.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {catPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3"
                      >
                        <div className="size-12 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                          {p.imageUrl ? (
                            <LazyImage
                              src={p.imageUrl}
                              alt={p.name}
                              priority
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs font-bold text-neutral-400">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-medium uppercase">{p.name}</span>
                          <span className="truncate text-[10px] tracking-wider text-neutral-500 uppercase">
                            {p.skills}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CYBERPUNK VARIANT
function TeamRosterCardCyberpunk({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden border-4 border-fuchsia-600/60 bg-[#050505] p-8 font-mono text-cyan-50 select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(217,70,239,0.15),transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="relative z-10 mb-8 flex items-center justify-between border-b border-cyan-500/30 pb-6">
        <div className="flex items-center gap-4">
          <div className="clip-path-polygon-[20%_0%,100%_0%,80%_100%,0%_100%] flex size-16 items-center justify-center bg-cyan-500 text-black">
            <ZapIcon className="size-8" />
          </div>
          <div>
            <h1 className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 bg-clip-text text-3xl font-black tracking-widest text-transparent uppercase drop-shadow-md">
              {team.name}
            </h1>
            <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase">
              ROSTER_SYS_ONLINE
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-xl font-black tracking-[0.2em] text-fuchsia-400">
            {auction.name}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 gap-6">
        {/* Left Side: Captain */}
        <div className="flex w-1/3 flex-col border border-cyan-500/30 bg-cyan-950/20 p-6 shadow-[0_0_20px_rgba(34,211,238,0.1)]">
          <div className="mb-2 inline-block w-max border-l-4 border-cyan-400 bg-cyan-500/20 px-2 py-1">
            <span className="text-[10px] font-bold tracking-widest text-cyan-300">
              ROLE_CAPTAIN
            </span>
          </div>

          <div className="relative my-6 aspect-square w-full border-2 border-fuchsia-500/50 bg-black p-1 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
            {captain?.imageUrl ? (
              <LazyImage
                src={captain.imageUrl}
                alt={captain.name}
                priority
                className="size-full object-cover mix-blend-screen"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-fuchsia-500/50">
                <StarIcon className="size-16" />
              </div>
            )}
            {/* Cyber accents */}
            <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-cyan-400" />
            <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-cyan-400" />
          </div>

          {captain && (
            <div className="mt-2 text-center">
              <h2 className="text-2xl font-black tracking-wider text-white uppercase">
                {captain.name}
              </h2>
              <span className="mt-1 block text-xs tracking-widest text-fuchsia-400">
                {captain.skills}
              </span>
            </div>
          )}

          <div className="mt-auto border-t border-cyan-500/30 pt-6">
            <div className="mb-2 flex justify-between text-xs">
              <span className="tracking-widest text-cyan-500">SQUAD_SIZE</span>
              <span className="font-bold text-fuchsia-400">{players.length}/MAX</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="tracking-widest text-cyan-500">ORG_OWNER</span>
              <span className="max-w-[120px] truncate font-bold text-white">
                {team.ownerName || "NULL"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Squad */}
        <div className="flex w-2/3 flex-col overflow-hidden border border-fuchsia-500/30 bg-black/60 p-6">
          <div className="flex flex-1 flex-col gap-4">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              return (
                <div key={cat.id} className="border border-cyan-500/20 bg-cyan-900/10 p-4">
                  <h4 className="mb-3 flex items-center gap-2 text-xs font-black tracking-widest text-cyan-400 uppercase">
                    <span className="block size-2 bg-fuchsia-500" /> {cat.name} {"// "}{" "}
                    {catPlayers.length}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {catPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 border-l-2 border-fuchsia-500/50 bg-black p-2 transition-colors hover:border-cyan-400"
                      >
                        <div className="size-10 shrink-0 border border-cyan-500/30 bg-neutral-900">
                          {p.imageUrl ? (
                            <LazyImage
                              src={p.imageUrl}
                              alt={p.name}
                              priority
                              className="size-full object-cover opacity-80 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] font-black text-cyan-600">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-xs font-bold text-white uppercase">
                            {p.name}
                          </span>
                          <span className="truncate text-[9px] tracking-widest text-fuchsia-300">
                            {p.skills}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. TRADING CARD VARIANT
function TeamRosterCardTradingCard({
  team,
  players,
  categories,
  auction,
  ref,
}: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col items-center justify-center bg-neutral-900 p-8 select-none"
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-xl border-[12px] border-white bg-neutral-100 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="pointer-events-none absolute inset-0 m-2 rounded-md border-8 border-red-700/80" />

        <div className="relative z-10 flex items-center justify-between border-b-8 border-black bg-red-700 p-6">
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-16 rounded-full bg-white object-contain p-1"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full border-2 border-black bg-white text-xl font-black text-red-700">
                {team.name.slice(0, 2)}
              </div>
            )}
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic drop-shadow-md">
              {team.name}
            </h1>
          </div>
          <div className="border-2 border-black bg-white px-4 py-1 text-lg font-black tracking-wider text-red-700 italic">
            TEAM ROSTER
          </div>
        </div>

        <div className="relative z-10 flex flex-1 gap-8 p-8">
          <div className="flex w-1/3 flex-col">
            <div className="mb-4 flex-1 border-4 border-black bg-white p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="mb-4 border-b-4 border-black bg-red-700 py-1 text-center text-xl font-black text-white italic">
                CAPTAIN
              </div>
              <div className="relative mb-4 aspect-square w-full overflow-hidden border-4 border-black bg-neutral-200">
                {captain?.imageUrl ? (
                  <LazyImage
                    src={captain.imageUrl}
                    alt={captain.name}
                    priority
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-neutral-400">
                    <ShieldIcon className="size-20" />
                  </div>
                )}
              </div>
              {captain && (
                <div className="text-center">
                  <h2 className="mb-1 text-2xl leading-tight font-black uppercase">
                    {captain.name}
                  </h2>
                  <span className="text-sm font-bold tracking-widest text-red-700 uppercase">
                    {captain.skills}
                  </span>
                </div>
              )}
            </div>
            <div className="border-4 border-white bg-black p-4 text-center text-sm font-bold text-white italic shadow-[0_0_0_4px_#000]">
              SQUAD: {players.length} PLAYERS
            </div>
          </div>

          <div className="flex w-2/3 flex-col gap-4">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              return (
                <div
                  key={cat.id}
                  className="flex flex-col border-4 border-black bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <div className="bg-black px-4 py-1 font-black tracking-wider text-white uppercase italic">
                    {cat.name}
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 p-4">
                    {catPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 border-b border-neutral-300 pb-1"
                      >
                        <span className="font-black text-red-700">#</span>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-bold uppercase">{p.name}</span>
                          <span className="truncate text-[9px] font-semibold tracking-wider text-neutral-500 uppercase">
                            {p.skills}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between bg-black p-4 text-white">
          <Logo src={auction.logoUrl} className="h-8 object-contain" iconClassName="size-6" />
          <span className="text-xs font-bold tracking-widest">OFFICIAL LEAGUE ASSET</span>
        </div>
      </div>
    </div>
  );
}

// 5. ELEGANT VARIANT
function TeamRosterCardElegant({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-[#0A0D14] p-12 font-serif text-[#EBE6D9] select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,32,48,0.8),#0A0D14)]" />
      <div className="pointer-events-none absolute inset-6 rounded-3xl border border-[#D4AF37]/30" />
      <div className="pointer-events-none absolute inset-8 rounded-[20px] border border-[#D4AF37]/10" />

      <div className="relative z-10 mb-8 flex flex-col items-center border-b border-[#D4AF37]/20 pb-8">
        <Logo
          src={auction.logoUrl}
          className="mb-4 size-16 object-contain opacity-80"
          iconClassName="size-8"
        />
        <h1
          className="mb-2 text-center text-5xl font-normal tracking-widest uppercase"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {team.name}
        </h1>
        <span className="text-xs font-light tracking-[0.4em] text-[#D4AF37] uppercase">
          Official Team Roster
        </span>
      </div>

      <div className="relative z-10 flex flex-1 gap-12">
        {/* Left col: Captain & Info */}
        <div className="flex w-1/3 flex-col items-center">
          <span className="mb-6 text-[10px] font-light tracking-[0.3em] text-[#D4AF37] uppercase">
            Team Captain
          </span>

          <div className="mb-6 size-56 rounded-full border border-[#D4AF37]/40 p-1">
            <div className="size-full overflow-hidden rounded-full bg-[#1A1F2D]">
              {captain?.imageUrl ? (
                <LazyImage
                  src={captain.imageUrl}
                  alt={captain.name}
                  priority
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-[#D4AF37]/30">
                  <CrownIcon className="size-16" />
                </div>
              )}
            </div>
          </div>

          {captain && (
            <div className="mb-10 w-full border-b border-[#D4AF37]/20 pb-6 text-center">
              <h2 className="mb-2 text-2xl font-normal tracking-wider uppercase">{captain.name}</h2>
              <span className="text-xs font-light tracking-[0.2em] text-[#D4AF37]/80 uppercase">
                {captain.skills}
              </span>
            </div>
          )}

          <div className="flex w-full flex-col items-center gap-4">
            <div className="text-center">
              <span className="mb-1 block text-[9px] font-light tracking-[0.2em] text-[#D4AF37]/70 uppercase">
                Owner
              </span>
              <span className="text-sm font-normal tracking-widest uppercase">
                {team.ownerName || "TBD"}
              </span>
            </div>
            <div className="text-center">
              <span className="mb-1 block text-[9px] font-light tracking-[0.2em] text-[#D4AF37]/70 uppercase">
                Squad Size
              </span>
              <span className="text-sm font-normal tracking-widest uppercase">
                {players.length} Players
              </span>
            </div>
          </div>
        </div>

        {/* Right col: Players list */}
        <div className="flex h-[700px] w-2/3 flex-col">
          <div className="flex-1 columns-2 gap-8 space-y-8 pr-4">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              return (
                <div key={cat.id} className="break-inside-avoid">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px w-6 bg-[#D4AF37]/50" />
                    <h4 className="text-xs font-light tracking-[0.3em] text-[#D4AF37] uppercase">
                      {cat.name}
                    </h4>
                  </div>
                  <div className="flex flex-col gap-4">
                    {catPlayers.map((p) => (
                      <div key={p.id} className="flex items-center gap-4">
                        <div className="size-10 shrink-0 overflow-hidden rounded-full border border-[#D4AF37]/20 bg-[#1A1F2D]">
                          {p.imageUrl ? (
                            <LazyImage
                              src={p.imageUrl}
                              alt={p.name}
                              priority
                              className="size-full object-cover"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-[10px] text-[#D4AF37]/40">
                              {p.name.slice(0, 2)}
                            </div>
                          )}
                        </div>
                        <div className="flex min-w-0 flex-col">
                          <span className="truncate text-sm font-normal tracking-wider uppercase">
                            {p.name}
                          </span>
                          <span className="truncate text-[9px] font-light tracking-[0.1em] text-white/50 uppercase">
                            {p.skills}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN EXPORT
export const TeamRosterCard = ({
  ref,
  ...props
}: TeamRosterCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  switch (props.variant) {
    case "minimal":
      return <TeamRosterCardMinimal {...props} ref={ref} />;
    case "cyberpunk":
      return <TeamRosterCardCyberpunk {...props} ref={ref} />;
    case "trading-card":
      return <TeamRosterCardTradingCard {...props} ref={ref} />;
    case "elegant":
      return <TeamRosterCardElegant {...props} ref={ref} />;
    case "default":
    default:
      return <TeamRosterCardDefault {...props} ref={ref} />;
  }
};

TeamRosterCard.displayName = "TeamRosterCard";
