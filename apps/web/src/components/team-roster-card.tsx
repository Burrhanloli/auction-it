import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon, ZapIcon, ShieldIcon, CrownIcon } from "lucide-react";
import React from "react";

import { Logo } from "#/components/logo";

export type CardVariant =
  | "default"
  | "minimal"
  | "cyberpunk"
  | "trading-card"
  | "elegant"
  | "formation"
  | "yearbook"
  | "org-chart"
  | "newspaper"
  | "dossier"
  | "jersey-wall";

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

// 2. MINIMAL VARIANT — Single-column list, warm off-white theme
function TeamRosterCardMinimal({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        background: "#FAFAF8",
        color: "#1C1C1C",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Top bar: team name + auction */}
      <div
        className="flex shrink-0 items-center justify-between px-16 py-8"
        style={{ borderBottom: "1px solid #D6D3CD" }}
      >
        <div className="flex items-center gap-5">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-14 object-contain"
            />
          ) : (
            <div
              className="flex size-14 items-center justify-center text-lg font-semibold uppercase"
              style={{ background: "#EEECEA", color: "#A8A29E", borderRadius: "8px" }}
            >
              {team.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1
              className="text-[32px] leading-none font-semibold tracking-wide uppercase"
              style={{ color: "#1C1C1C" }}
            >
              {team.name}
            </h1>
            <span
              className="text-[13px] font-normal tracking-widest uppercase"
              style={{ color: "#A8A29E" }}
            >
              Squad Roster
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[12px] font-medium tracking-wider uppercase"
            style={{ color: "#A8A29E" }}
          >
            {auction.name}
          </span>
          <Logo
            src={auction.logoUrl}
            className="size-10 object-contain opacity-50 grayscale"
            iconClassName="size-5"
          />
        </div>
      </div>

      {/* Captain inline header row */}
      <div
        className="flex shrink-0 items-center gap-5 px-16 py-6"
        style={{ borderBottom: "1px solid #D6D3CD" }}
      >
        {captain ? (
          <>
            <div
              className="size-12 shrink-0 overflow-hidden rounded-full"
              style={{ background: "#EEECEA" }}
            >
              {captain.imageUrl ? (
                <LazyImage
                  src={captain.imageUrl}
                  alt={captain.name}
                  priority
                  className="size-full object-contain"
                />
              ) : (
                <div
                  className="flex size-full items-center justify-center text-sm font-semibold"
                  style={{ color: "#A8A29E" }}
                >
                  {captain.name.slice(0, 2)}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span
                className="text-[18px] leading-snug font-semibold uppercase"
                style={{ color: "#1C1C1C" }}
              >
                {captain.name}
              </span>
              <span className="text-[11px] font-normal tracking-wider" style={{ color: "#A8A29E" }}>
                {captain.skills}
              </span>
            </div>
            <span
              className="ml-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-semibold tracking-widest uppercase"
              style={{ background: "#1C1C1C", color: "#FAFAF8" }}
            >
              <CrownIcon className="size-3" /> Captain
            </span>
          </>
        ) : (
          <span className="text-[14px] italic" style={{ color: "#A8A29E" }}>
            No captain assigned
          </span>
        )}
        <div className="ml-auto flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "#A8A29E" }}
            >
              Owner
            </span>
            <span className="text-[14px] font-medium" style={{ color: "#1C1C1C" }}>
              {team.ownerName || "TBD"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "#A8A29E" }}
            >
              Players
            </span>
            <span className="text-[14px] font-medium" style={{ color: "#1C1C1C" }}>
              {players.length}
            </span>
          </div>
        </div>
      </div>

      {/* Single-column flat list grouped by category */}
      <div className="flex flex-1 flex-col overflow-hidden px-16 py-6">
        <div className="flex flex-1 flex-col gap-0 overflow-hidden">
          {categories.map((cat, catIdx) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id}>
                {catIdx > 0 && <div className="my-4" style={{ borderTop: "1px solid #D6D3CD" }} />}
                <h4
                  className="mb-3 text-[11px] font-semibold tracking-[0.25em] uppercase"
                  style={{ color: "#A8A29E" }}
                >
                  {cat.name}
                </h4>
                <div className="flex flex-col gap-1">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: "1px solid #EEECEA" }}
                    >
                      <span
                        className="text-[16px] font-medium uppercase"
                        style={{ color: "#1C1C1C" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="text-[12px] font-normal tracking-wider"
                        style={{ color: "#A8A29E" }}
                      >
                        {p.skills}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[14px] font-normal italic" style={{ color: "#A8A29E" }}>
                No players acquired yet.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex shrink-0 items-center justify-center px-16 py-5"
        style={{ borderTop: "1px solid #D6D3CD" }}
      >
        <span
          className="text-[10px] font-medium tracking-[0.3em] uppercase"
          style={{ color: "#A8A29E" }}
        >
          Official Roster — {team.name}
        </span>
      </div>
    </div>
  );
}

// 3. CYBERPUNK VARIANT — Dashboard grid, deep indigo + neon
function TeamRosterCardCyberpunk({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: "#0C0A1A",
        color: "#E0E0E0",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-50 opacity-[0.04]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(173,255,47,0.15) 2px, rgba(173,255,47,0.15) 4px)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(173,255,47,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(173,255,47,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, rgba(173,255,47,0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(255,20,147,0.06) 0%, transparent 50%)",
        }}
      />

      {/* Neon border */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          border: "2px solid #ADFF2F",
          boxShadow: "inset 0 0 30px rgba(173,255,47,0.08), 0 0 20px rgba(173,255,47,0.1)",
        }}
      />

      {/* Captain banner — full width, horizontal */}
      <div
        className="relative z-10 flex shrink-0 items-stretch"
        style={{ height: "200px", borderBottom: "2px solid #ADFF2F" }}
      >
        {/* Captain image left */}
        <div
          className="relative w-[200px] shrink-0 overflow-hidden"
          style={{ background: "#0F0D22" }}
        >
          {captain?.imageUrl ? (
            <LazyImage
              src={captain.imageUrl}
              alt={captain.name}
              priority
              className="absolute inset-0 size-full object-contain"
              style={{ filter: "contrast(1.1) saturate(1.2)" }}
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ color: "#ADFF2F" }}
            >
              <ZapIcon className="size-16 opacity-30" />
            </div>
          )}
          {/* Corner accents */}
          <div
            className="absolute top-0 left-0 size-5"
            style={{ borderTop: "3px solid #FF1493", borderLeft: "3px solid #FF1493" }}
          />
          <div
            className="absolute right-0 bottom-0 size-5"
            style={{ borderBottom: "3px solid #ADFF2F", borderRight: "3px solid #ADFF2F" }}
          />
        </div>

        {/* Captain info + team info */}
        <div
          className="flex flex-1 items-center justify-between px-10"
          style={{ background: "linear-gradient(90deg, #100E24 0%, #0C0A1A 100%)" }}
        >
          <div className="flex flex-col gap-2">
            <span
              className="text-[10px] font-bold tracking-[0.5em] uppercase"
              style={{ color: "#FF1493" }}
            >
              &gt;&gt; CAPTAIN_DESIGNATION
            </span>
            <h2
              className="text-[36px] leading-none font-black tracking-wider uppercase"
              style={{ color: "#ADFF2F" }}
            >
              {captain?.name ?? "UNASSIGNED"}
            </h2>
            {captain && (
              <span className="text-[12px] tracking-widest" style={{ color: "#FF1493" }}>
                {captain.skills}
              </span>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3">
              {team.logoUrl ? (
                <LazyImage
                  src={team.logoUrl}
                  alt={team.name}
                  priority
                  className="size-12 object-contain"
                  style={{ filter: "brightness(1.2)" }}
                />
              ) : (
                <div
                  className="flex size-12 items-center justify-center text-sm font-black"
                  style={{ border: "1px solid #ADFF2F", color: "#ADFF2F" }}
                >
                  {team.name.slice(0, 2)}
                </div>
              )}
              <h1
                className="text-[28px] font-black tracking-widest uppercase"
                style={{ color: "#ADFF2F" }}
              >
                {team.name}
              </h1>
            </div>
            <span className="text-[10px] tracking-[0.4em]" style={{ color: "#FF1493" }}>
              {auction.name} {"// SYS_ONLINE"}
            </span>
            <div className="flex gap-6 text-[10px]" style={{ color: "#ADFF2F" }}>
              <span>
                SQUAD: <span style={{ color: "#FF1493" }}>{players.length}</span>
              </span>
              <span>
                OWNER:{" "}
                <span className="max-w-[120px] truncate" style={{ color: "#FF1493" }}>
                  {team.ownerName || "NULL"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Player grid — 3 columns of compact cards */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden p-6">
        <div className="flex flex-1 flex-col gap-4 overflow-hidden">
          {categories.map((cat) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="inline-block size-2" style={{ background: "#FF1493" }} />
                  <h4
                    className="text-[11px] font-bold tracking-[0.4em] uppercase"
                    style={{ color: "#ADFF2F" }}
                  >
                    {cat.name} [{catPlayers.length}]
                  </h4>
                  <div
                    className="flex-1"
                    style={{ borderBottom: "1px solid rgba(173,255,47,0.15)" }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2.5"
                      style={{
                        background: "rgba(173,255,47,0.03)",
                        border: "1px solid rgba(173,255,47,0.2)",
                        boxShadow: "0 0 8px rgba(173,255,47,0.04)",
                      }}
                    >
                      <div
                        className="size-9 shrink-0 overflow-hidden"
                        style={{ border: "1px solid rgba(255,20,147,0.4)", background: "#0F0D22" }}
                      >
                        {p.imageUrl ? (
                          <LazyImage
                            src={p.imageUrl}
                            alt={p.name}
                            priority
                            className="size-full object-contain opacity-85"
                          />
                        ) : (
                          <div
                            className="flex size-full items-center justify-center text-[10px] font-black"
                            style={{ color: "#ADFF2F" }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span
                          className="truncate text-[12px] font-bold uppercase"
                          style={{ color: "#E0E0E0" }}
                        >
                          {p.name}
                        </span>
                        <span
                          className="truncate text-[9px] tracking-widest"
                          style={{ color: "#FF1493" }}
                        >
                          {p.skills}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[13px] tracking-widest" style={{ color: "#ADFF2F" }}>
                {"// NO_PLAYERS_ACQUIRED"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-8 py-4"
        style={{ borderTop: "1px solid #ADFF2F", background: "rgba(173,255,47,0.03)" }}
      >
        <span className="text-[9px] tracking-[0.4em]" style={{ color: "#FF1493" }}>
          &gt; ROSTER_PROTOCOL_v2.1
        </span>
        <span className="text-[9px] tracking-[0.4em]" style={{ color: "#ADFF2F" }}>
          SYSTEM::AUTHENTICATED
        </span>
      </div>
    </div>
  );
}

// 4. TRADING CARD VARIANT — Magazine spread, 1080×1350, vintage cream/burgundy
function TeamRosterCardTradingCard({
  team,
  players,
  categories,
  auction,
  ref,
}: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  const categoryStartIndices = new Map<string, number>();
  let currentCount = 0;
  for (const cat of categories) {
    categoryStartIndices.set(cat.id, currentCount);
    currentCount += (categoryMap.get(cat.id) || []).length;
  }

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#F5F0E1",
        color: "#1A1A1A",
      }}
      className="relative flex shrink-0 overflow-hidden select-none"
    >
      {/* Matte black outer border */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{ border: "6px solid #1A1A1A" }}
      />
      {/* Inner accent border */}
      <div
        className="pointer-events-none absolute inset-[10px] z-40"
        style={{ border: "2px solid #6B1D2A" }}
      />

      {/* Left 40% — Captain full-height portrait card */}
      <div
        className="relative z-10 flex shrink-0 flex-col"
        style={{ width: "40%", borderRight: "4px solid #1A1A1A" }}
      >
        {/* Captain header */}
        <div
          className="flex shrink-0 items-center justify-center py-5"
          style={{ background: "#6B1D2A", borderBottom: "3px solid #1A1A1A" }}
        >
          <span
            className="text-[13px] font-bold tracking-[0.4em] uppercase"
            style={{ color: "#F5F0E1" }}
          >
            ★ Team Captain
          </span>
        </div>

        {/* Captain portrait — takes remaining space */}
        <div className="relative flex-1 overflow-hidden" style={{ background: "#E8E1CE" }}>
          {captain?.imageUrl ? (
            <LazyImage
              src={captain.imageUrl}
              alt={captain.name}
              priority
              className="absolute inset-0 size-full object-contain"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ color: "#6B1D2A" }}
            >
              <ShieldIcon className="size-28 opacity-20" />
            </div>
          )}
          {/* Gradient overlay at bottom */}
          <div
            className="absolute right-0 bottom-0 left-0 h-[200px]"
            style={{
              background: "linear-gradient(to top, rgba(26,26,26,0.85) 0%, transparent 100%)",
            }}
          />
        </div>

        {/* Captain name plate at bottom of portrait */}
        <div
          className="flex shrink-0 flex-col items-center gap-2 py-6"
          style={{ background: "#1A1A1A", borderTop: "3px solid #6B1D2A" }}
        >
          <h2
            className="text-center text-[26px] leading-tight font-bold tracking-wider uppercase"
            style={{ color: "#F5F0E1" }}
          >
            {captain?.name ?? "Unassigned"}
          </h2>
          {captain && (
            <span
              className="text-[12px] font-normal tracking-widest uppercase"
              style={{ color: "#C9917A" }}
            >
              {captain.skills}
            </span>
          )}
        </div>

        {/* Team info strip */}
        <div
          className="flex shrink-0 items-center justify-between px-6 py-4"
          style={{ background: "#6B1D2A", borderTop: "2px solid #1A1A1A" }}
        >
          <div className="flex items-center gap-3">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-10 object-contain"
                style={{ filter: "brightness(1.3)" }}
              />
            ) : (
              <div
                className="flex size-10 items-center justify-center text-sm font-bold"
                style={{ background: "#F5F0E1", color: "#6B1D2A", borderRadius: "4px" }}
              >
                {team.name.slice(0, 2)}
              </div>
            )}
            <span
              className="text-[14px] font-bold tracking-wider uppercase"
              style={{ color: "#F5F0E1" }}
            >
              {team.name}
            </span>
          </div>
          <span
            className="text-[11px] font-normal tracking-wider"
            style={{ color: "#F5F0E1", opacity: 0.7 }}
          >
            {players.length} Players
          </span>
        </div>
      </div>

      {/* Right 60% — Numbered checklist roster */}
      <div className="relative z-10 flex flex-1 flex-col" style={{ background: "#F5F0E1" }}>
        {/* Header */}
        <div
          className="flex shrink-0 items-center justify-between px-10 py-6"
          style={{ borderBottom: "3px solid #1A1A1A" }}
        >
          <div>
            <h1
              className="text-[28px] font-bold tracking-wider uppercase"
              style={{ color: "#6B1D2A" }}
            >
              Squad Roster
            </h1>
            <span className="text-[11px] tracking-[0.3em] uppercase" style={{ color: "#A89078" }}>
              {auction.name} — Official Card
            </span>
          </div>
          <Logo
            src={auction.logoUrl}
            className="size-12 object-contain opacity-60"
            iconClassName="size-6"
          />
        </div>

        {/* Numbered player list grouped by category */}
        <div className="flex flex-1 flex-col overflow-hidden px-10 py-6">
          <div className="flex flex-1 flex-col gap-6 overflow-hidden">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              const startIndex = categoryStartIndices.get(cat.id) || 0;
              return (
                <div key={cat.id}>
                  <h4
                    className="mb-3 text-[13px] font-bold tracking-[0.3em] uppercase"
                    style={{
                      color: "#6B1D2A",
                      borderBottom: "2px solid #6B1D2A",
                      paddingBottom: "6px",
                    }}
                  >
                    {cat.name}
                  </h4>
                  <div className="flex flex-col gap-0">
                    {catPlayers.map((p, i) => {
                      const num = startIndex + i + 1;
                      return (
                        <div
                          key={p.id}
                          className="flex items-baseline gap-4 py-2.5"
                          style={{ borderBottom: "1px solid #D9CEBD" }}
                        >
                          <span
                            className="w-8 shrink-0 text-right text-[18px] font-bold"
                            style={{ color: "#6B1D2A" }}
                          >
                            {String(num).padStart(2, "0")}
                          </span>
                          <span
                            className="flex-1 text-[16px] font-bold uppercase"
                            style={{ color: "#1A1A1A" }}
                          >
                            {p.name}
                          </span>
                          <span
                            className="text-[12px] font-normal tracking-wider"
                            style={{ color: "#A89078" }}
                          >
                            {p.skills}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {players.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <span className="text-[14px] italic" style={{ color: "#A89078" }}>
                  No players acquired.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex shrink-0 items-center justify-between px-10 py-4"
          style={{ borderTop: "3px solid #1A1A1A", background: "#EDE7D6" }}
        >
          <span
            className="text-[10px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "#6B1D2A" }}
          >
            Collector's Edition
          </span>
          <span className="text-[10px] tracking-[0.2em] uppercase" style={{ color: "#A89078" }}>
            {team.ownerName ? `Owner: ${team.ownerName}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}

// 5. ELEGANT VARIANT — Centered column, navy/gold
function TeamRosterCardElegant({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Georgia', serif",
        background: "#0B1026",
        color: "#F5F1E8",
      }}
      className="relative flex shrink-0 flex-col items-center overflow-hidden select-none"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }}
      />
      {/* Decorative gold border */}
      <div
        className="pointer-events-none absolute inset-5 z-0"
        style={{ border: "1px solid rgba(201,168,76,0.25)" }}
      />
      <div
        className="pointer-events-none absolute inset-7 z-0"
        style={{ border: "1px solid rgba(201,168,76,0.1)" }}
      />

      {/* Top centered: Auction + Team */}
      <div className="relative z-10 flex w-full shrink-0 flex-col items-center pt-12 pb-6">
        <Logo
          src={auction.logoUrl}
          className="mb-3 size-12 object-contain opacity-70"
          iconClassName="size-6"
        />
        <span
          className="mb-2 text-[10px] font-normal tracking-[0.5em] uppercase"
          style={{ color: "#C9A84C" }}
        >
          {auction.name}
        </span>
        <h1
          className="text-center text-[42px] leading-none font-normal tracking-[0.15em] uppercase"
          style={{ color: "#F5F1E8" }}
        >
          {team.name}
        </h1>
        <span
          className="mt-2 text-[11px] font-normal tracking-[0.4em] uppercase"
          style={{ color: "#C9A84C" }}
        >
          Official Team Roster
        </span>
        {/* Gold divider */}
        <div
          className="mt-6 h-px w-48"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
        />
      </div>

      {/* Captain: centered circular photo */}
      <div className="relative z-10 flex shrink-0 flex-col items-center py-4">
        <span
          className="mb-4 text-[9px] font-normal tracking-[0.4em] uppercase"
          style={{ color: "#C9A84C" }}
        >
          Captain
        </span>
        <div
          className="rounded-full p-[3px]"
          style={{ background: "linear-gradient(135deg, #C9A84C, #8B6914)" }}
        >
          <div className="size-36 overflow-hidden rounded-full" style={{ background: "#13193A" }}>
            {captain?.imageUrl ? (
              <LazyImage
                src={captain.imageUrl}
                alt={captain.name}
                priority
                className="size-full object-contain"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{ color: "rgba(201,168,76,0.25)" }}
              >
                <CrownIcon className="size-14" />
              </div>
            )}
          </div>
        </div>
        {captain && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <h2
              className="text-[22px] font-normal tracking-wider uppercase"
              style={{ color: "#F5F1E8" }}
            >
              {captain.name}
            </h2>
            <span className="text-[11px] font-normal tracking-[0.2em]" style={{ color: "#C9A84C" }}>
              {captain.skills}
            </span>
          </div>
        )}
      </div>

      {/* Owner + squad meta */}
      <div className="relative z-10 flex shrink-0 items-center justify-center gap-12 py-3">
        <div className="flex flex-col items-center">
          <span
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(201,168,76,0.6)" }}
          >
            Owner
          </span>
          <span className="text-[13px] tracking-wider uppercase" style={{ color: "#F5F1E8" }}>
            {team.ownerName || "TBD"}
          </span>
        </div>
        <div className="h-5 w-px" style={{ background: "rgba(201,168,76,0.25)" }} />
        <div className="flex flex-col items-center">
          <span
            className="text-[9px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(201,168,76,0.6)" }}
          >
            Squad
          </span>
          <span className="text-[13px] tracking-wider uppercase" style={{ color: "#F5F1E8" }}>
            {players.length} Players
          </span>
        </div>
      </div>

      {/* Gold divider */}
      <div
        className="relative z-10 my-3 h-px w-[700px]"
        style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
      />

      {/* Two-column player table: name left, skills right */}
      <div className="relative z-10 flex w-[700px] flex-1 flex-col overflow-hidden py-2">
        <div className="flex flex-1 flex-col gap-0 overflow-hidden">
          {categories.map((cat, catIdx) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id}>
                {catIdx > 0 && (
                  <div
                    className="my-3 h-px"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)",
                    }}
                  />
                )}
                <h4
                  className="mb-2 text-center text-[10px] font-normal tracking-[0.4em] uppercase"
                  style={{ color: "#C9A84C" }}
                >
                  {cat.name}
                </h4>
                <div className="flex flex-col">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between py-2"
                      style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
                    >
                      <span
                        className="text-[14px] font-normal tracking-wider uppercase"
                        style={{ color: "#F5F1E8" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="text-[11px] font-normal tracking-wider"
                        style={{ color: "rgba(201,168,76,0.6)" }}
                      >
                        {p.skills}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[13px] italic" style={{ color: "rgba(201,168,76,0.4)" }}>
                No players acquired.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom gold line + branding */}
      <div className="relative z-10 flex w-full shrink-0 flex-col items-center pt-4 pb-10">
        <div
          className="mb-4 h-px w-48"
          style={{ background: "linear-gradient(90deg, transparent, #C9A84C, transparent)" }}
        />
        <span
          className="text-[9px] tracking-[0.4em] uppercase"
          style={{ color: "rgba(201,168,76,0.4)" }}
        >
          {team.name} — Official Roster
        </span>
      </div>
    </div>
  );
}

// 6. FORMATION VARIANT — Sports formation/lineup view on a field
function TeamRosterCardFormation({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        background: "linear-gradient(180deg, #1B5E20 0%, #2E7D32 35%, #388E3C 60%, #1B5E20 100%)",
        color: "#FFFFFF",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Field lines overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Center circle */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          width: "300px",
          height: "300px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          border: "2px solid rgba(255,255,255,0.12)",
          borderRadius: "50%",
        }}
      />
      {/* Half-way line */}
      <div
        className="pointer-events-none absolute right-0 left-0 z-0"
        style={{ top: "50%", height: "2px", background: "rgba(255,255,255,0.12)" }}
      />
      {/* Center dot */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          width: "12px",
          height: "12px",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(255,255,255,0.2)",
          borderRadius: "50%",
        }}
      />

      {/* Top banner */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-5"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
          borderBottom: "3px solid rgba(255,255,255,0.3)",
        }}
      >
        <div className="flex items-center gap-4">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-14 object-contain"
              style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.5))" }}
            />
          ) : (
            <div
              className="flex size-14 items-center justify-center text-lg font-black uppercase"
              style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px" }}
            >
              {team.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1
              className="text-[32px] leading-none font-black tracking-wider uppercase"
              style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              {team.name}
            </h1>
            <span
              className="text-[11px] font-medium tracking-[0.3em] uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Formation Lineup
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span
              className="text-[10px] font-medium tracking-wider uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {auction.name}
            </span>
            <span className="text-[14px] font-bold" style={{ color: "rgba(255,255,255,0.8)" }}>
              {players.length} Players
            </span>
          </div>
          <Logo
            src={auction.logoUrl}
            className="size-10 object-contain opacity-60"
            iconClassName="size-5"
          />
        </div>
      </div>

      {/* Captain — front & center with spotlight */}
      <div className="relative z-10 flex shrink-0 flex-col items-center py-6">
        <span
          className="mb-2 text-[9px] font-bold tracking-[0.5em] uppercase"
          style={{ color: "#FFD54F" }}
        >
          ★ Captain
        </span>
        <div
          className="relative size-28 overflow-hidden rounded-full"
          style={{
            border: "4px solid #FFD54F",
            boxShadow: "0 0 30px rgba(255,213,79,0.35), 0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {captain?.imageUrl ? (
            <LazyImage
              src={captain.imageUrl}
              alt={captain.name}
              priority
              className="size-full object-contain"
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ background: "#1B5E20", color: "#FFD54F" }}
            >
              <CrownIcon className="size-10" />
            </div>
          )}
        </div>
        <h2
          className="mt-3 text-[20px] font-black tracking-wider uppercase"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
        >
          {captain?.name ?? "UNASSIGNED"}
        </h2>
        {captain && (
          <span
            className="text-[11px] font-medium tracking-wider"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            {captain.skills}
          </span>
        )}
      </div>

      {/* Player formation — rows by category */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-6 px-10 pb-6">
        {categories.map((cat) => {
          const catPlayers = categoryMap.get(cat.id) || [];
          if (!catPlayers.length) return null;
          return (
            <div key={cat.id} className="flex w-full flex-col items-center gap-3">
              <span
                className="text-[10px] font-bold tracking-[0.4em] uppercase"
                style={{ color: "rgba(255,255,255,0.45)" }}
              >
                {cat.name}
              </span>
              <div className="flex flex-wrap items-center justify-center gap-6">
                {catPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col items-center gap-1.5"
                    style={{ width: "90px" }}
                  >
                    <div
                      className="relative size-16 overflow-hidden rounded-full"
                      style={{
                        border: "3px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
                        background: "#2E7D32",
                      }}
                    >
                      {p.imageUrl ? (
                        <LazyImage
                          src={p.imageUrl}
                          alt={p.name}
                          priority
                          className="size-full object-contain"
                        />
                      ) : (
                        <div
                          className="flex size-full items-center justify-center text-[12px] font-black"
                          style={{ color: "rgba(255,255,255,0.7)" }}
                        >
                          {p.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span
                      className="max-w-full truncate text-center text-[11px] font-bold uppercase"
                      style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
                    >
                      {p.name}
                    </span>
                    <span
                      className="text-[8px] font-medium tracking-wider uppercase"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      {p.skills}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <span
              className="text-[14px] font-medium italic"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              No players acquired yet.
            </span>
          </div>
        )}
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-4"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%)",
          borderTop: "3px solid rgba(255,255,255,0.3)",
        }}
      >
        <span
          className="text-[9px] font-bold tracking-[0.4em] uppercase"
          style={{ color: "rgba(255,255,255,0.5)" }}
        >
          Official Lineup — {team.name}
        </span>
        <span
          className="text-[9px] font-medium tracking-[0.3em] uppercase"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Owner: {team.ownerName || "TBD"}
        </span>
      </div>
    </div>
  );
}

// 7. YEARBOOK VARIANT — Classic school yearbook page
function TeamRosterCardYearbook({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#FDF6E3",
        color: "#1E3A5F",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Subtle paper texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 5px)",
        }}
      />
      {/* Decorative border */}
      <div
        className="pointer-events-none absolute inset-4 z-0"
        style={{ border: "2px solid #1E3A5F", opacity: 0.15 }}
      />
      <div
        className="pointer-events-none absolute inset-6 z-0"
        style={{ border: "1px solid #8B2252", opacity: 0.1 }}
      />

      {/* Header: CLASS OF 2026 */}
      <div className="relative z-10 flex shrink-0 flex-col items-center pt-12 pb-4">
        <span
          className="text-[11px] font-normal tracking-[0.6em] uppercase"
          style={{ color: "#8B2252" }}
        >
          Class of 2026
        </span>
        <h1
          className="mt-2 text-center text-[48px] leading-none font-bold tracking-wider uppercase"
          style={{ color: "#1E3A5F" }}
        >
          {team.name}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          {team.logoUrl && (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-8 object-contain opacity-60"
            />
          )}
          <span
            className="text-[12px] font-normal tracking-[0.3em] uppercase"
            style={{ color: "#8B2252", opacity: 0.7 }}
          >
            {auction.name} Edition
          </span>
        </div>
        {/* Decorative line */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px w-20" style={{ background: "#8B2252", opacity: 0.3 }} />
          <StarIcon className="size-4" style={{ color: "#8B2252", opacity: 0.4 }} />
          <div className="h-px w-20" style={{ background: "#8B2252", opacity: 0.3 }} />
        </div>
      </div>

      {/* Captain featured — larger photo with gold star */}
      <div className="relative z-10 flex shrink-0 flex-col items-center py-4">
        <div className="relative">
          <div
            className="size-40 overflow-hidden"
            style={{
              border: "4px solid #1E3A5F",
              borderRadius: "8px",
              background: "#EDE4CE",
              boxShadow: "0 4px 20px rgba(30,58,95,0.15)",
            }}
          >
            {captain?.imageUrl ? (
              <LazyImage
                src={captain.imageUrl}
                alt={captain.name}
                priority
                className="size-full object-contain"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{ color: "#1E3A5F", opacity: 0.2 }}
              >
                <CrownIcon className="size-16" />
              </div>
            )}
          </div>
          {/* Gold star badge */}
          <div
            className="absolute -top-2 -right-2 flex size-8 items-center justify-center rounded-full"
            style={{ background: "#D4AF37", boxShadow: "0 2px 8px rgba(212,175,55,0.5)" }}
          >
            <StarIcon className="size-4" style={{ color: "#FFFFFF" }} />
          </div>
        </div>
        <h2
          className="mt-3 text-[22px] font-bold tracking-wider uppercase"
          style={{ color: "#1E3A5F" }}
        >
          {captain?.name ?? "Unassigned"}
        </h2>
        {captain && (
          <span
            className="text-[12px] font-normal tracking-wider italic"
            style={{ color: "#8B2252" }}
          >
            {captain.skills}
          </span>
        )}
        <span
          className="mt-1 inline-flex items-center gap-1 rounded-full px-4 py-1 text-[9px] font-bold tracking-[0.3em] uppercase"
          style={{ background: "#1E3A5F", color: "#FDF6E3" }}
        >
          <CrownIcon className="size-3" /> Team Captain
        </span>
      </div>

      {/* Player grid — small square thumbnails */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-14 py-4">
        <div className="flex flex-1 flex-col gap-5 overflow-hidden">
          {categories.map((cat) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id}>
                <h4
                  className="mb-3 text-center text-[11px] font-bold tracking-[0.4em] uppercase"
                  style={{ color: "#8B2252" }}
                >
                  — {cat.name} —
                </h4>
                <div className="flex flex-wrap justify-center gap-4">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex flex-col items-center gap-1"
                      style={{ width: "100px" }}
                    >
                      <div
                        className="size-20 overflow-hidden"
                        style={{
                          border: "2px solid #1E3A5F",
                          borderRadius: "6px",
                          background: "#EDE4CE",
                        }}
                      >
                        {p.imageUrl ? (
                          <LazyImage
                            src={p.imageUrl}
                            alt={p.name}
                            priority
                            className="size-full object-contain"
                          />
                        ) : (
                          <div
                            className="flex size-full items-center justify-center text-[14px] font-bold"
                            style={{ color: "#1E3A5F", opacity: 0.3 }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span
                        className="max-w-full truncate text-center text-[11px] font-bold uppercase"
                        style={{ color: "#1E3A5F" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="max-w-full truncate text-center text-[9px] font-normal italic"
                        style={{ color: "#8B2252", opacity: 0.7 }}
                      >
                        {p.skills}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span
                className="text-[14px] font-normal italic"
                style={{ color: "#8B2252", opacity: 0.5 }}
              >
                No players acquired yet.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-14 py-5"
        style={{ borderTop: "2px solid rgba(30,58,95,0.15)" }}
      >
        <span
          className="text-[10px] font-normal tracking-[0.3em] uppercase"
          style={{ color: "#8B2252", opacity: 0.5 }}
        >
          {auction.name}
        </span>
        <span
          className="text-[10px] font-normal tracking-[0.3em] uppercase"
          style={{ color: "#1E3A5F", opacity: 0.4 }}
        >
          Squad: {players.length} Members
        </span>
      </div>
    </div>
  );
}

// 8. ORG CHART VARIANT — Hierarchy/org chart tree
function TeamRosterCardOrgChart({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Inter', 'SF Mono', 'Roboto Mono', sans-serif",
        background: "#FFFFFF",
        color: "#334155",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Subtle dot grid */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, #94A3B8 0.8px, transparent 0.8px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header bar */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-5"
        style={{ borderBottom: "2px solid #E2E8F0" }}
      >
        <div className="flex items-center gap-4">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-10 object-contain"
            />
          ) : (
            <div
              className="flex size-10 items-center justify-center text-sm font-bold uppercase"
              style={{ background: "#EFF6FF", color: "#2563EB", borderRadius: "8px" }}
            >
              {team.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1
              className="text-[24px] leading-none font-bold tracking-wide uppercase"
              style={{ color: "#0F172A" }}
            >
              {team.name}
            </h1>
            <span
              className="text-[11px] font-medium tracking-wider uppercase"
              style={{ color: "#94A3B8" }}
            >
              Organization Chart
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-[11px] font-medium tracking-wider uppercase"
            style={{ color: "#94A3B8" }}
          >
            {auction.name}
          </span>
          <Logo
            src={auction.logoUrl}
            className="size-8 object-contain opacity-40"
            iconClassName="size-4"
          />
        </div>
      </div>

      {/* Captain — top center card */}
      <div className="relative z-10 flex shrink-0 flex-col items-center pt-8 pb-4">
        <div
          className="flex items-center gap-5 px-8 py-5"
          style={{
            background: "#EFF6FF",
            border: "2px solid #2563EB",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(37,99,235,0.1)",
          }}
        >
          <div
            className="size-20 shrink-0 overflow-hidden"
            style={{ borderRadius: "10px", border: "2px solid #2563EB", background: "#DBEAFE" }}
          >
            {captain?.imageUrl ? (
              <LazyImage
                src={captain.imageUrl}
                alt={captain.name}
                priority
                className="size-full object-contain"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{ color: "#2563EB" }}
              >
                <CrownIcon className="size-8" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <span
              className="text-[9px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "#2563EB" }}
            >
              Captain
            </span>
            <h2
              className="text-[22px] leading-tight font-bold tracking-wide uppercase"
              style={{ color: "#0F172A" }}
            >
              {captain?.name ?? "Unassigned"}
            </h2>
            {captain && (
              <span className="text-[12px] font-medium" style={{ color: "#64748B" }}>
                {captain.skills}
              </span>
            )}
            <span className="text-[10px] font-medium" style={{ color: "#94A3B8" }}>
              Owner: {team.ownerName || "TBD"}
            </span>
          </div>
        </div>
        {/* Connector line going down */}
        <div className="h-8 w-0.5" style={{ background: "#2563EB" }} />
      </div>

      {/* Category branches */}
      <div className="relative z-10 flex flex-1 flex-col items-center gap-4 overflow-hidden px-8 pb-6">
        {/* Horizontal connector */}
        <div className="h-0.5 w-3/4" style={{ background: "#2563EB" }} />

        <div className="flex w-full flex-1 flex-col gap-4 overflow-hidden">
          {categories.map((cat) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id} className="flex flex-col items-center gap-2">
                {/* Vertical connector from horizontal line */}
                <div className="h-3 w-0.5" style={{ background: "#2563EB" }} />
                {/* Category label */}
                <div
                  className="mb-1 px-5 py-2"
                  style={{
                    background: "#F8FAFC",
                    border: "1.5px solid #CBD5E1",
                    borderRadius: "8px",
                    borderLeft: "4px solid #2563EB",
                  }}
                >
                  <span
                    className="text-[11px] font-bold tracking-[0.2em] uppercase"
                    style={{ color: "#2563EB" }}
                  >
                    {cat.name}
                  </span>
                  <span className="ml-3 text-[10px] font-medium" style={{ color: "#94A3B8" }}>
                    {catPlayers.length} {catPlayers.length === 1 ? "member" : "members"}
                  </span>
                </div>
                {/* Player chips */}
                <div className="flex flex-wrap justify-center gap-2">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-2 px-3 py-1.5"
                      style={{
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        borderRadius: "6px",
                      }}
                    >
                      <div
                        className="size-6 shrink-0 overflow-hidden"
                        style={{ borderRadius: "4px", background: "#EFF6FF" }}
                      >
                        {p.imageUrl ? (
                          <LazyImage
                            src={p.imageUrl}
                            alt={p.name}
                            priority
                            className="size-full object-contain"
                          />
                        ) : (
                          <div
                            className="flex size-full items-center justify-center text-[8px] font-bold"
                            style={{ color: "#2563EB" }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span
                        className="text-[12px] font-semibold uppercase"
                        style={{ color: "#0F172A" }}
                      >
                        {p.name}
                      </span>
                      <span className="text-[9px] font-medium" style={{ color: "#94A3B8" }}>
                        {p.skills}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[14px] font-medium" style={{ color: "#94A3B8" }}>
                No members assigned.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-4"
        style={{ borderTop: "2px solid #E2E8F0" }}
      >
        <span
          className="text-[10px] font-medium tracking-wider uppercase"
          style={{ color: "#94A3B8" }}
        >
          {players.length} Total Members
        </span>
        <span
          className="text-[10px] font-medium tracking-wider uppercase"
          style={{ color: "#94A3B8" }}
        >
          {team.name} — Org Structure
        </span>
      </div>
    </div>
  );
}

// 9. NEWSPAPER VARIANT — Front-page newspaper layout
function TeamRosterCardNewspaper({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        background: "#F4ECD8",
        color: "#1A1A1A",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Aged paper texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(139,115,85,0.3) 3px, rgba(139,115,85,0.3) 4px)",
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ boxShadow: "inset 0 0 150px rgba(139,115,85,0.15)" }}
      />

      {/* Masthead */}
      <div className="relative z-10 flex shrink-0 flex-col items-center px-10 pt-8 pb-4">
        <div className="mb-2 flex w-full items-center justify-between">
          <span
            className="text-[10px] font-normal tracking-wider uppercase"
            style={{ color: "#8B7355" }}
          >
            Vol. XXVI — No. 1
          </span>
          <span
            className="text-[10px] font-normal tracking-wider uppercase"
            style={{ color: "#8B7355" }}
          >
            {auction.name} Edition
          </span>
        </div>
        <div className="my-1 h-0.5 w-full" style={{ background: "#1A1A1A" }} />
        <h1
          className="my-3 text-center text-[64px] leading-none font-black uppercase"
          style={{
            fontFamily: "'Georgia', 'Times New Roman', serif",
            color: "#1A1A1A",
            letterSpacing: "0.05em",
          }}
        >
          {team.name}
        </h1>
        <div className="my-1 h-px w-full" style={{ background: "#1A1A1A" }} />
        <div className="flex w-full items-center justify-between py-1">
          <span className="text-[10px] font-normal italic" style={{ color: "#8B7355" }}>
            "The Official Squad Gazette"
          </span>
          <span
            className="text-[10px] font-normal tracking-wider uppercase"
            style={{ color: "#8B7355" }}
          >
            {players.length} Players Registered
          </span>
        </div>
        <div className="h-[3px] w-full" style={{ background: "#1A1A1A" }} />
      </div>

      {/* Main content — two-column newspaper layout */}
      <div className="relative z-10 flex flex-1 overflow-hidden px-10 py-4">
        {/* Left column — Captain story (45%) */}
        <div
          className="flex shrink-0 flex-col pr-6"
          style={{ width: "45%", borderRight: "1px solid #C4B89A" }}
        >
          <h2
            className="mb-3 text-[28px] leading-tight font-bold uppercase"
            style={{ color: "#1A1A1A", fontFamily: "'Georgia', serif" }}
          >
            Captain Leads {team.name} Into Battle
          </h2>

          {/* Captain photo */}
          <div
            className="relative mb-4 w-full overflow-hidden"
            style={{
              aspectRatio: "4/3",
              background: "#E8DFC8",
              border: "1px solid #C4B89A",
            }}
          >
            {captain?.imageUrl ? (
              <LazyImage
                src={captain.imageUrl}
                alt={captain.name}
                priority
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <div
                className="flex size-full items-center justify-center"
                style={{ color: "#8B7355" }}
              >
                <ShieldIcon className="size-20 opacity-15" />
              </div>
            )}
          </div>
          <span className="mb-2 text-[9px] font-normal italic" style={{ color: "#8B7355" }}>
            {captain ? `${captain.name} — Team Captain` : "Captain photo placeholder"}
          </span>

          {/* Fake article body */}
          <p
            className="mb-3 text-[13px] leading-relaxed"
            style={{ color: "#3D3D2C", textAlign: "justify" }}
          >
            <span
              className="text-[24px] leading-none font-bold"
              style={{ float: "left", marginRight: "4px", marginTop: "2px", color: "#1A1A1A" }}
            >
              {(captain?.name ?? "T")[0]}
            </span>
            {captain?.name ?? "The captain"} has been designated as the leader of {team.name},
            tasked with steering the squad of {players.length} talented players through the
            competitive landscape of {auction.name}. Under the ownership of{" "}
            {team.ownerName || "the management"}, the team looks to make a formidable impact this
            season.
          </p>

          {captain && (
            <div className="flex flex-col gap-1 border-t py-3" style={{ borderColor: "#C4B89A" }}>
              <span
                className="text-[10px] font-bold tracking-wider uppercase"
                style={{ color: "#8B7355" }}
              >
                Captain Profile
              </span>
              <span className="text-[16px] font-bold uppercase" style={{ color: "#1A1A1A" }}>
                {captain.name}
              </span>
              <span className="text-[12px] font-normal italic" style={{ color: "#8B7355" }}>
                {captain.skills}
              </span>
            </div>
          )}

          {/* Owner info */}
          <div
            className="mt-auto flex flex-col gap-1 border-t py-3"
            style={{ borderColor: "#C4B89A" }}
          >
            <span
              className="text-[10px] font-bold tracking-wider uppercase"
              style={{ color: "#8B7355" }}
            >
              Team Ownership
            </span>
            <span className="text-[14px] font-bold" style={{ color: "#1A1A1A" }}>
              {team.ownerName || "TBD"}
            </span>
          </div>
        </div>

        {/* Right columns — dense roster listing (55%) */}
        <div className="flex flex-1 flex-col overflow-hidden pl-6">
          <h3
            className="mb-3 text-[18px] font-bold tracking-wider uppercase"
            style={{ color: "#1A1A1A", borderBottom: "2px solid #1A1A1A", paddingBottom: "6px" }}
          >
            Full Squad Roster
          </h3>

          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            {categories.map((cat) => {
              const catPlayers = categoryMap.get(cat.id) || [];
              if (!catPlayers.length) return null;
              return (
                <div key={cat.id}>
                  <h4
                    className="mb-2 text-[12px] font-bold tracking-[0.2em] uppercase"
                    style={{
                      color: "#8B7355",
                      borderBottom: "1px solid #C4B89A",
                      paddingBottom: "4px",
                    }}
                  >
                    {cat.name}
                  </h4>
                  {/* Two-column list within right side */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                    {catPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-baseline justify-between py-1.5"
                        style={{ borderBottom: "1px dotted #D4C5A9" }}
                      >
                        <span
                          className="truncate text-[13px] font-bold uppercase"
                          style={{ color: "#1A1A1A" }}
                        >
                          {p.name}
                        </span>
                        <span
                          className="ml-2 shrink-0 text-[10px] font-normal italic"
                          style={{ color: "#8B7355" }}
                        >
                          {p.skills}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {players.length === 0 && (
              <div className="flex flex-1 items-center justify-center">
                <span className="text-[14px] italic" style={{ color: "#8B7355" }}>
                  No acquisitions reported.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-4"
        style={{ borderTop: "3px solid #1A1A1A" }}
      >
        <span
          className="text-[10px] font-bold tracking-wider uppercase"
          style={{ color: "#8B7355" }}
        >
          {team.name} Gazette — Official Record
        </span>
        <span
          className="text-[10px] font-normal tracking-wider uppercase"
          style={{ color: "#8B7355" }}
        >
          {players.length} Players • {categories.length} Categories
        </span>
      </div>
    </div>
  );
}

// 10. DOSSIER VARIANT — Classified dossier/ID badge
function TeamRosterCardDossier({ team, players, categories, auction, ref }: TeamRosterCardProps) {
  const { captain, categoryMap } = useRosterData(team, players);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Courier New', 'Courier', monospace",
        background: "#D4C5A9",
        color: "#3D3D2C",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Manila paper texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(61,61,44,0.1) 8px, rgba(61,61,44,0.1) 9px)",
        }}
      />

      {/* CLASSIFIED watermark */}
      <div
        className="pointer-events-none absolute z-[5] flex items-center justify-center"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%) rotate(-35deg)",
        }}
      >
        <span
          className="text-[120px] font-black tracking-[0.15em] uppercase"
          style={{ color: "rgba(185,28,28,0.07)" }}
        >
          CLASSIFIED
        </span>
      </div>

      {/* File folder tab top-right */}
      <div
        className="absolute top-0 right-12 z-10 flex h-[40px] w-[160px] items-center justify-center rounded-b-lg border-r-2 border-b-2 border-l-2"
        style={{
          background: "#C4B494",
          borderColor: "#A89878",
        }}
      >
        <span
          className="text-[10px] font-bold tracking-[0.2em] uppercase"
          style={{ color: "#3D3D2C" }}
        >
          FILE #{team.id.slice(0, 6).toUpperCase()}
        </span>
      </div>

      {/* Header: PERSONNEL FILE */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-6"
        style={{ borderBottom: "2px solid #A89878" }}
      >
        <div>
          <span
            className="text-[10px] font-bold tracking-[0.4em] uppercase"
            style={{ color: "#B91C1C" }}
          >
            ■ CLASSIFIED — PERSONNEL FILE
          </span>
          <h1
            className="mt-1 text-[32px] leading-none font-black tracking-wider uppercase"
            style={{ color: "#3D3D2C" }}
          >
            {team.name}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {team.logoUrl && (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-12 object-contain opacity-50"
              style={{ filter: "sepia(0.5)" }}
            />
          )}
          <div className="flex flex-col items-end">
            <span
              className="text-[9px] font-bold tracking-wider uppercase"
              style={{ color: "#8B7355" }}
            >
              OPERATION
            </span>
            <span className="text-[13px] font-bold uppercase" style={{ color: "#3D3D2C" }}>
              {auction.name}
            </span>
          </div>
        </div>
      </div>

      {/* Captain section — ID badge style */}
      <div
        className="relative z-10 flex shrink-0 items-start gap-6 px-10 py-6"
        style={{ borderBottom: "1px dashed #A89878" }}
      >
        {/* Passport-style photo */}
        <div
          className="shrink-0 overflow-hidden"
          style={{
            width: "120px",
            height: "150px",
            border: "3px solid #3D3D2C",
            background: "#EDE4CE",
          }}
        >
          {captain?.imageUrl ? (
            <LazyImage
              src={captain.imageUrl}
              alt={captain.name}
              priority
              className="size-full object-contain"
              style={{ filter: "sepia(0.15) contrast(1.05)" }}
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ color: "#3D3D2C", opacity: 0.15 }}
            >
              <ShieldIcon className="size-14" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 pt-1">
          <span
            className="text-[9px] font-bold tracking-[0.3em] uppercase"
            style={{ color: "#B91C1C" }}
          >
            COMMANDING OFFICER
          </span>
          <h2
            className="text-[26px] font-black tracking-wider uppercase"
            style={{ color: "#3D3D2C" }}
          >
            {captain?.name ?? "[ UNASSIGNED ]"}
          </h2>
          {captain && (
            <>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span
                    className="text-[8px] font-bold tracking-wider uppercase"
                    style={{ color: "#8B7355" }}
                  >
                    DESIGNATION
                  </span>
                  <span className="text-[13px] font-bold uppercase">{captain.skills}</span>
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[8px] font-bold tracking-wider uppercase"
                    style={{ color: "#8B7355" }}
                  >
                    STATUS
                  </span>
                  <span className="text-[13px] font-bold uppercase" style={{ color: "#B91C1C" }}>
                    ACTIVE
                  </span>
                </div>
              </div>
              {/* Simulated barcode */}
              <div className="mt-1 flex items-end gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i % 3 === 0 ? "3px" : "2px",
                      height: `${12 + (i % 5) * 3}px`,
                      background: "#3D3D2C",
                      opacity: 0.6,
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <div className="mt-1 flex flex-col">
            <span
              className="text-[8px] font-bold tracking-wider uppercase"
              style={{ color: "#8B7355" }}
            >
              HANDLER
            </span>
            <span className="text-[13px] font-bold uppercase">{team.ownerName || "UNKNOWN"}</span>
          </div>
        </div>
      </div>

      {/* Operative roster — compact ID-rows */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden px-10 py-4">
        <span
          className="mb-3 text-[10px] font-bold tracking-[0.3em] uppercase"
          style={{ color: "#B91C1C" }}
        >
          ■ OPERATIVE ROSTER — {players.length} PERSONNEL
        </span>
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {categories.map((cat) => {
            const catPlayers = categoryMap.get(cat.id) || [];
            if (!catPlayers.length) return null;
            return (
              <div key={cat.id}>
                <h4
                  className="mb-2 text-[10px] font-bold tracking-[0.2em] uppercase"
                  style={{
                    color: "#8B7355",
                    borderBottom: "1px solid #A89878",
                    paddingBottom: "3px",
                  }}
                >
                  DIVISION: {cat.name}
                </h4>
                <div className="flex flex-col gap-1">
                  {catPlayers.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 py-1"
                      style={{ borderBottom: "1px dotted #C4B494" }}
                    >
                      {/* Tiny avatar */}
                      <div
                        className="size-7 shrink-0 overflow-hidden"
                        style={{ border: "1px solid #3D3D2C", background: "#EDE4CE" }}
                      >
                        {p.imageUrl ? (
                          <LazyImage
                            src={p.imageUrl}
                            alt={p.name}
                            priority
                            className="size-full object-contain"
                            style={{ filter: "sepia(0.2)" }}
                          />
                        ) : (
                          <div
                            className="flex size-full items-center justify-center text-[8px] font-bold"
                            style={{ color: "#3D3D2C" }}
                          >
                            {p.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-bold uppercase">
                        {p.name}
                      </span>
                      <span
                        className="shrink-0 text-[10px] font-normal uppercase"
                        style={{ color: "#8B7355" }}
                      >
                        {p.skills}
                      </span>
                      {/* Mini barcode */}
                      <div className="flex shrink-0 items-end gap-[1px]">
                        {Array.from({ length: 15 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              width: "1.5px",
                              height: `${6 + (i % 4) * 2}px`,
                              background: "#3D3D2C",
                              opacity: 0.35,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {players.length === 0 && (
            <div className="flex flex-1 items-center justify-center">
              <span className="text-[14px] font-bold uppercase" style={{ color: "#8B7355" }}>
                [ NO PERSONNEL ON FILE ]
              </span>
            </div>
          )}
        </div>
      </div>

      {/* AUTHORIZED stamp + footer */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-5"
        style={{ borderTop: "2px solid #A89878" }}
      >
        <div
          className="flex items-center gap-2 px-5 py-2"
          style={{
            border: "3px solid #B91C1C",
            borderRadius: "4px",
            transform: "rotate(-3deg)",
          }}
        >
          <span
            className="text-[14px] font-black tracking-[0.3em] uppercase"
            style={{ color: "#B91C1C" }}
          >
            ✓ AUTHORIZED
          </span>
        </div>
        <span
          className="text-[9px] font-bold tracking-wider uppercase"
          style={{ color: "#8B7355" }}
        >
          {team.name} — Personnel Dossier
        </span>
      </div>
    </div>
  );
}

// 11. JERSEY WALL VARIANT — Jersey display wall / locker room
function TeamRosterCardJerseyWall({
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
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        background: "linear-gradient(180deg, #2C1810 0%, #3D2317 50%, #2C1810 100%)",
        color: "#F5F0E8",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Wood grain texture */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(210,180,140,0.3) 20px, rgba(210,180,140,0.3) 22px)",
        }}
      />
      {/* Warm ambient light */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 30%, rgba(212,175,55,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Header */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between px-10 py-5"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.4) 100%)",
          borderBottom: "3px solid #D4AF37",
        }}
      >
        <div className="flex items-center gap-4">
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-14 object-contain"
              style={{ filter: "drop-shadow(0 2px 8px rgba(212,175,55,0.3))" }}
            />
          ) : (
            <div
              className="flex size-14 items-center justify-center text-lg font-black uppercase"
              style={{ border: "2px solid #D4AF37", borderRadius: "8px", color: "#D4AF37" }}
            >
              {team.name.slice(0, 2)}
            </div>
          )}
          <div>
            <h1
              className="text-[28px] leading-none font-black tracking-wider uppercase"
              style={{ color: "#F5F0E8", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
            >
              {team.name}
            </h1>
            <span
              className="text-[11px] font-medium tracking-[0.3em] uppercase"
              style={{ color: "#D4AF37" }}
            >
              Jersey Wall — {auction.name}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "rgba(245,240,232,0.5)" }}
          >
            Squad: {players.length} Players
          </span>
          <span
            className="text-[10px] font-medium tracking-wider uppercase"
            style={{ color: "rgba(245,240,232,0.4)" }}
          >
            Owner: {team.ownerName || "TBD"}
          </span>
        </div>
      </div>

      {/* Captain jersey — larger, centered, with "C" armband */}
      <div className="relative z-10 flex shrink-0 flex-col items-center py-6">
        <span
          className="mb-3 text-[9px] font-bold tracking-[0.5em] uppercase"
          style={{ color: "#D4AF37" }}
        >
          ★ Captain's Jersey
        </span>
        <div className="relative">
          {/* Jersey shape via clip-path */}
          <div
            className="flex h-[180px] w-[160px] flex-col items-center justify-center p-[30px_16px_16px] shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
            style={{
              clipPath: "polygon(20% 0%, 80% 0%, 100% 15%, 100% 100%, 0% 100%, 0% 15%)",
              background: "linear-gradient(180deg, #F5F0E8 0%, #E8E0D0 100%)",
            }}
          >
            <span
              className="text-center text-[16px] leading-tight font-black tracking-wider uppercase"
              style={{ color: "#2C1810" }}
            >
              {captain?.name ?? "TBD"}
            </span>
            {captain && (
              <span
                className="mt-1 text-[9px] font-medium tracking-wider uppercase"
                style={{ color: "#8B7355" }}
              >
                {captain.skills}
              </span>
            )}
          </div>
          {/* C armband */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              top: "14px",
              left: "-8px",
              width: "28px",
              height: "28px",
              background: "#D4AF37",
              borderRadius: "50%",
              boxShadow: "0 2px 8px rgba(212,175,55,0.5)",
            }}
          >
            <span className="text-[14px] font-black" style={{ color: "#2C1810" }}>
              C
            </span>
          </div>
        </div>
      </div>

      {/* Jersey grid by category */}
      <div className="relative z-10 flex flex-1 flex-col items-center gap-4 overflow-hidden px-10 pb-6">
        {categories.map((cat) => {
          const catPlayers = categoryMap.get(cat.id) || [];
          if (!catPlayers.length) return null;
          return (
            <div key={cat.id} className="flex w-full flex-col items-center gap-3">
              {/* Shelf/rack label */}
              <div className="flex w-full items-center gap-3">
                <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.25)" }} />
                <span
                  className="text-[10px] font-bold tracking-[0.3em] uppercase"
                  style={{ color: "#D4AF37" }}
                >
                  {cat.name}
                </span>
                <div className="h-px flex-1" style={{ background: "rgba(212,175,55,0.25)" }} />
              </div>
              {/* Jersey grid */}
              <div className="flex flex-wrap justify-center gap-4">
                {catPlayers.map((p) => (
                  <div key={p.id} className="flex flex-col items-center gap-1">
                    {/* Jersey shape */}
                    <div
                      className="flex h-[120px] w-[110px] flex-col items-center justify-center p-[22px_10px_10px] shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
                      style={{
                        clipPath: "polygon(20% 0%, 80% 0%, 100% 15%, 100% 100%, 0% 100%, 0% 15%)",
                        background:
                          "linear-gradient(180deg, rgba(245,240,232,0.9) 0%, rgba(232,224,208,0.9) 100%)",
                      }}
                    >
                      <span
                        className="max-w-full truncate text-center text-[12px] leading-tight font-black tracking-wider uppercase"
                        style={{ color: "#2C1810" }}
                      >
                        {p.name}
                      </span>
                      <span
                        className="mt-1 max-w-full truncate text-center text-[8px] font-medium tracking-wider uppercase"
                        style={{ color: "#8B7355" }}
                      >
                        {p.skills}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {players.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <span
              className="text-[14px] font-medium italic"
              style={{ color: "rgba(245,240,232,0.4)" }}
            >
              No jerseys on display.
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-center px-10 py-4"
        style={{
          background: "rgba(0,0,0,0.3)",
          borderTop: "2px solid #D4AF37",
        }}
      >
        <span
          className="text-[9px] font-bold tracking-[0.4em] uppercase"
          style={{ color: "#D4AF37" }}
        >
          {team.name} — Hall of Jerseys
        </span>
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
    case "formation":
      return <TeamRosterCardFormation {...props} ref={ref} />;
    case "yearbook":
      return <TeamRosterCardYearbook {...props} ref={ref} />;
    case "org-chart":
      return <TeamRosterCardOrgChart {...props} ref={ref} />;
    case "newspaper":
      return <TeamRosterCardNewspaper {...props} ref={ref} />;
    case "dossier":
      return <TeamRosterCardDossier {...props} ref={ref} />;
    case "jersey-wall":
      return <TeamRosterCardJerseyWall {...props} ref={ref} />;
    case "default":
    default:
      return <TeamRosterCardDefault {...props} ref={ref} />;
  }
};

TeamRosterCard.displayName = "TeamRosterCard";
