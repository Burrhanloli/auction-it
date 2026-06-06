import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon, HammerIcon, ZapIcon, ShieldIcon, CrownIcon } from "lucide-react";
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
}

interface Auction {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface PlayerSoldCardProps {
  player: Player;
  team: Team;
  auction: Auction;
  variant?: CardVariant;
  ref?: React.Ref<HTMLDivElement>;
}

// 1. DEFAULT VARIANT
function PlayerSoldCardDefault({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 font-sans text-white select-none"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black" />

      <div className="pointer-events-none absolute top-6 left-6 z-0 size-3 border-t border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute top-6 right-6 z-0 size-3 border-t border-r border-[#3c3c3c]" />
      <div className="pointer-events-none absolute bottom-6 left-6 z-0 size-3 border-b border-l border-[#3c3c3c]" />
      <div className="pointer-events-none absolute right-6 bottom-6 z-0 size-3 border-r border-b border-[#3c3c3c]" />

      <div className="relative z-10 flex h-40 shrink-0 items-center justify-between border-b border-[#3c3c3c] bg-neutral-950/80 px-8 backdrop-blur-md">
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
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      </div>

      <div className="z-10 flex min-h-0 flex-1 flex-col items-center justify-center p-8">
        <div className="relative flex w-full max-w-5xl flex-col items-center">
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
            <div className="absolute right-0 bottom-0 left-0 h-2 bg-m-blue-light" />
          </div>

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

      <div className="relative z-10 flex shrink-0 flex-col">
        <div className="flex h-28 items-center justify-center bg-white px-8 text-black shadow-[0_-10px_40px_rgba(255,255,255,0.1)]">
          <div className="flex items-center gap-6">
            <span className="text-title-lg font-bold tracking-[4px] uppercase">SOLD FOR</span>
            <span className="text-[64px] leading-none font-black tracking-[1px]">
              {player.soldPoints?.toLocaleString() || 0}
            </span>
            <span className="text-title-lg font-bold tracking-[4px] uppercase">POINTS</span>
          </div>
        </div>

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

// 2. MINIMAL VARIANT
function PlayerSoldCardMinimal({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-white font-sans text-neutral-900 select-none"
    >
      <div className="absolute inset-0 bg-neutral-50/50" />

      {/* Clean elegant lines */}
      <div className="absolute top-12 right-12 bottom-12 left-12 border border-neutral-200" />

      <div className="z-10 flex h-32 shrink-0 items-center justify-between px-20 pt-20">
        <div className="flex items-center gap-4">
          <Logo
            src={auction.logoUrl}
            className="size-16 shrink-0 object-contain grayscale"
            iconClassName="size-8"
          />
          <h2 className="text-xl font-medium tracking-[0.2em] text-neutral-400 uppercase">
            {auction.name}
          </h2>
        </div>
      </div>

      <div className="z-10 flex min-h-0 flex-1 flex-col items-center justify-center p-8">
        <div className="relative mb-12 flex aspect-square w-[400px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-neutral-100 shadow-xl">
          {player.imageUrl ? (
            <LazyImage
              src={player.imageUrl}
              alt={player.name}
              priority
              className="size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-300">
              <StarIcon className="mb-2 size-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center text-center">
          <span className="mb-4 text-sm font-semibold tracking-[0.3em] text-neutral-400 uppercase">
            {player.category?.name || "UNASSIGNED"}
          </span>
          <h1 className="text-[72px] leading-[1] font-light tracking-tight text-neutral-900 uppercase">
            {player.name}
          </h1>
          <span className="mt-4 text-xl font-medium tracking-[0.1em] text-neutral-500 uppercase">
            {player.skills}
          </span>
        </div>
      </div>

      <div className="z-10 flex shrink-0 flex-col px-20 pb-20">
        <div className="flex items-center justify-between border-t border-neutral-200 pt-12">
          <div className="flex items-center gap-6">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-20 shrink-0 object-contain"
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-400 uppercase">
                {team.name.slice(0, 2)}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-[0.2em] text-neutral-400 uppercase">
                Acquired By
              </span>
              <h3 className="text-3xl font-medium tracking-wide text-neutral-900 uppercase">
                {team.name}
              </h3>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold tracking-[0.2em] text-neutral-400 uppercase">
              Sold For
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[56px] leading-none font-semibold text-neutral-900">
                {player.soldPoints?.toLocaleString() || 0}
              </span>
              <span className="text-xl font-medium text-neutral-500 uppercase">pts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CYBERPUNK VARIANT
function PlayerSoldCardCyberpunk({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden border-2 border-cyan-500/50 bg-[#09090b] font-mono text-white select-none"
    >
      {/* Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Glitch overlays */}
      <div className="absolute -top-32 -right-32 size-[400px] rounded-full bg-fuchsia-600/20 blur-[120px]" />
      <div className="absolute -bottom-32 -left-32 size-[400px] rounded-full bg-cyan-600/20 blur-[120px]" />

      <div className="relative z-10 flex h-32 items-center justify-between border-b border-cyan-500/30 bg-black/60 px-10 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <div className="clip-path-polygon-[10%_0,100%_0,90%_100%,0_100%] flex size-14 items-center justify-center bg-cyan-500 text-black">
            <ZapIcon className="size-8" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-[0.3em] text-fuchsia-500">
              SYS.AUCTION
            </span>
            <h2 className="text-2xl font-bold tracking-widest text-white uppercase">
              {auction.name}
            </h2>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-xl font-black tracking-[0.2em] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
            TRANSACTION
          </span>
          <span className="block text-sm tracking-widest text-white/70">SUCCESSFUL</span>
        </div>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-8">
        <div className="relative mb-8 aspect-square w-80 border-l-4 border-fuchsia-500 bg-neutral-900/80 p-2 shadow-[0_0_30px_rgba(217,70,239,0.2)]">
          <div className="absolute -top-2 -left-2 size-4 border-t-2 border-l-2 border-cyan-400" />
          <div className="absolute -right-2 -bottom-2 size-4 border-r-2 border-b-2 border-cyan-400" />
          {player.imageUrl ? (
            <LazyImage
              src={player.imageUrl}
              alt={player.name}
              priority
              className="size-full object-cover mix-blend-luminosity transition-all hover:mix-blend-normal"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-cyan-500/50">
              <StarIcon className="size-20" />
            </div>
          )}
        </div>

        <div className="text-center">
          <div className="clip-path-polygon-[10%_0,100%_0,90%_100%,0_100%] mb-4 inline-block bg-cyan-500 px-6 py-1 text-sm font-bold tracking-widest text-black">
            CAT: {player.category?.name || "N/A"}
          </div>
          <h1 className="bg-gradient-to-r from-cyan-400 via-white to-fuchsia-500 bg-clip-text text-[64px] leading-none font-black tracking-tighter text-transparent uppercase drop-shadow-lg">
            {player.name}
          </h1>
          <span className="mt-2 block text-xl font-bold tracking-[0.2em] text-cyan-200">
            {player.skills}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 border-t border-fuchsia-500/30 bg-black/80 backdrop-blur-md">
        <div className="flex w-1/2 flex-col justify-center border-r border-fuchsia-500/30 p-10">
          <span className="mb-2 text-xs font-bold tracking-[0.3em] text-fuchsia-500">
            NEW ENTITY ASSIGNMENT
          </span>
          <div className="flex items-center gap-6">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-20 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
              />
            ) : (
              <div className="flex size-20 items-center justify-center border border-cyan-500 bg-cyan-500/10 text-2xl font-bold text-cyan-400">
                {team.name.slice(0, 2)}
              </div>
            )}
            <h3 className="text-3xl font-black tracking-wider text-white uppercase">{team.name}</h3>
          </div>
        </div>
        <div className="flex w-1/2 flex-col items-end justify-center bg-cyan-500/5 p-10">
          <span className="mb-2 text-xs font-bold tracking-[0.3em] text-cyan-500">
            CREDITS TRANSFERRED
          </span>
          <div className="flex items-end gap-3">
            <span className="text-[64px] leading-none font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
              {player.soldPoints?.toLocaleString() || 0}
            </span>
            <span className="mb-2 text-xl font-bold text-cyan-500/80">PTS</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. TRADING CARD VARIANT
function PlayerSoldCardTradingCard({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col items-center justify-center bg-neutral-800 p-8 select-none"
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border-[16px] border-[#e8dcc4] bg-white shadow-2xl">
        {/* Inner Foil border */}
        <div className="pointer-events-none absolute inset-0 z-20 border-4 border-[#b89947] opacity-60" />

        <div className="absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />

        <div className="relative z-10 flex h-24 items-center justify-between border-b-8 border-[#b89947] bg-[#1a1a1a] px-8">
          <Logo
            src={auction.logoUrl}
            className="h-12 w-auto object-contain"
            iconClassName="size-8"
          />
          <div className="rounded-full border-2 border-white bg-[#b89947] px-6 py-2 shadow-md">
            <span className="text-lg font-black tracking-wider text-black italic">
              ROOKIE / VET
            </span>
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col">
          <div className="relative flex-1 bg-neutral-200">
            {player.imageUrl ? (
              <LazyImage
                src={player.imageUrl}
                alt={player.name}
                priority
                className="size-full object-cover object-top"
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-neutral-300 text-neutral-500">
                <ShieldIcon className="size-32" />
              </div>
            )}
            {/* Gradient fade at bottom of image */}
            <div className="absolute right-0 bottom-0 left-0 h-40 bg-gradient-to-t from-white to-transparent" />

            {/* Team Logo Badge */}
            <div className="absolute right-8 bottom-6 flex size-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
              {team.logoUrl ? (
                <LazyImage
                  src={team.logoUrl}
                  alt={team.name}
                  priority
                  className="size-24 object-contain"
                />
              ) : (
                <span className="text-3xl font-black text-black">{team.name.slice(0, 2)}</span>
              )}
            </div>
          </div>

          <div className="relative bg-white px-10 pt-4 pb-10 text-black">
            <div className="mb-2">
              <span className="text-xl font-bold tracking-widest text-[#b89947] uppercase">
                {team.name}
              </span>
            </div>
            <h1 className="mb-2 text-[64px] leading-none font-black tracking-tighter uppercase">
              {player.name}
            </h1>
            <div className="flex items-center gap-4">
              <span className="bg-black px-4 py-1 text-xl font-bold text-white uppercase">
                {player.category?.name || "CAT"}
              </span>
              <span className="text-xl font-semibold text-neutral-600 uppercase">
                {player.skills}
              </span>
            </div>

            <div className="mt-8 flex items-center justify-between border-t-4 border-black pt-6">
              <div className="flex items-center gap-4">
                <HammerIcon className="size-10 text-black" />
                <span className="text-3xl font-black tracking-widest uppercase">SOLD</span>
              </div>
              <div className="text-right">
                <span className="text-[48px] leading-none font-black text-black">
                  {player.soldPoints?.toLocaleString() || 0}{" "}
                  <span className="text-2xl text-neutral-500">PTS</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. ELEGANT VARIANT
function PlayerSoldCardElegant({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px" }}
      className="relative flex shrink-0 flex-col overflow-hidden bg-[#0A0D14] font-serif text-[#EBE6D9] select-none"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(25,32,48,0.8),#0A0D14)]" />

      <div className="pointer-events-none absolute inset-6 rounded-3xl border border-[#D4AF37]/30" />
      <div className="pointer-events-none absolute inset-8 rounded-[20px] border border-[#D4AF37]/10" />

      <div className="relative z-10 flex flex-col items-center pt-16 pb-8">
        <Logo
          src={auction.logoUrl}
          className="mb-4 size-16 object-contain opacity-80"
          iconClassName="size-8"
        />
        <span className="text-sm font-light tracking-[0.4em] text-[#D4AF37] uppercase">
          {auction.name}
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-16">
        <div className="relative mb-12 size-80 rounded-full border border-[#D4AF37]/40 p-2">
          <div className="size-full overflow-hidden rounded-full bg-[#1A1F2D]">
            {player.imageUrl ? (
              <LazyImage
                src={player.imageUrl}
                alt={player.name}
                priority
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[#D4AF37]/50">
                <CrownIcon className="size-20" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center text-center">
          <h1
            className="text-[64px] leading-tight font-normal tracking-wide text-white uppercase"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {player.name}
          </h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="h-px w-12 bg-[#D4AF37]/50" />
            <span className="text-lg font-light tracking-[0.2em] text-[#D4AF37] uppercase">
              {player.skills}
            </span>
            <span className="h-px w-12 bg-[#D4AF37]/50" />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col items-center pb-20">
        <span className="mb-6 text-xs font-light tracking-[0.3em] text-neutral-400 uppercase">
          Officially Acquired By
        </span>
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-end text-right">
            <span className="text-2xl font-normal tracking-wider text-white uppercase">
              {team.name}
            </span>
            <span className="text-sm font-light tracking-widest text-[#D4AF37]">
              {player.category?.name || "ELITE"}
            </span>
          </div>

          <div className="h-16 w-px bg-[#D4AF37]/30" />

          <div className="flex flex-col items-start text-left">
            <span className="text-3xl font-normal text-white">
              {player.soldPoints?.toLocaleString() || 0}
            </span>
            <span className="text-sm font-light tracking-widest text-[#D4AF37] uppercase">
              Points
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// MAIN EXPORT
export const PlayerSoldCard = ({
  ref,
  ...props
}: PlayerSoldCardProps & { ref?: React.Ref<HTMLDivElement> }) => {
  switch (props.variant) {
    case "minimal":
      return <PlayerSoldCardMinimal {...props} ref={ref} />;
    case "cyberpunk":
      return <PlayerSoldCardCyberpunk {...props} ref={ref} />;
    case "trading-card":
      return <PlayerSoldCardTradingCard {...props} ref={ref} />;
    case "elegant":
      return <PlayerSoldCardElegant {...props} ref={ref} />;
    case "default":
    default:
      return <PlayerSoldCardDefault {...props} ref={ref} />;
  }
};

PlayerSoldCard.displayName = "PlayerSoldCard";
