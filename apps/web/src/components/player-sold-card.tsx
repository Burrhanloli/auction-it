import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon, HammerIcon, ZapIcon, ShieldIcon, CrownIcon } from "lucide-react";
import React from "react";

import { Logo } from "#/components/logo";

export type CardVariant =
  | "default"
  | "minimal"
  | "cyberpunk"
  | "trading-card"
  | "elegant"
  | "breaking-news"
  | "receipt"
  | "movie-poster"
  | "social-story"
  | "stats-card"
  | "polaroid";

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

// 2. MINIMAL VARIANT — Horizontal Split Layout
function PlayerSoldCardMinimal({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{ width: "1080px", height: "1080px", fontFamily: "Inter, sans-serif" }}
      className="relative flex shrink-0 overflow-hidden select-none"
    >
      {/* Left 50% — Full-bleed player image */}
      <div className="relative w-1/2 shrink-0" style={{ backgroundColor: "#ECEAE5" }}>
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            priority
            className="absolute inset-0 size-full object-contain"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{ backgroundColor: "#ECEAE5" }}
          >
            <StarIcon className="size-24" style={{ color: "#A8A29E" }} />
          </div>
        )}
      </div>

      {/* Right 50% — Stacked content */}
      <div
        className="flex w-1/2 flex-col justify-between p-12"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        {/* Top: Auction name */}
        <div className="flex items-center gap-3">
          <Logo
            src={auction.logoUrl}
            className="size-10 shrink-0 object-contain grayscale"
            iconClassName="size-5"
          />
          <span
            className="text-sm font-medium tracking-[0.15em] uppercase"
            style={{ color: "#A8A29E" }}
          >
            {auction.name}
          </span>
        </div>

        {/* Middle: Player info */}
        <div className="flex flex-col gap-5">
          <div className="h-px w-16" style={{ backgroundColor: "#A8A29E" }} />
          <h1
            className="text-[56px] leading-[1.05] font-bold tracking-tight uppercase"
            style={{ color: "#1C1C1C" }}
          >
            {player.name}
          </h1>
          <span
            className="text-lg font-normal tracking-[0.08em] uppercase"
            style={{ color: "#A8A29E" }}
          >
            {player.skills}
          </span>
          <span
            className="inline-flex w-fit items-center border px-3 py-1 text-xs font-semibold tracking-[0.2em] uppercase"
            style={{ borderColor: "#A8A29E", color: "#1C1C1C" }}
          >
            {player.category?.name || "UNASSIGNED"}
          </span>
        </div>

        {/* Bottom: Sold price & team */}
        <div className="flex flex-col gap-6">
          <div className="h-px w-full" style={{ backgroundColor: "#E5E2DB" }} />

          <div className="flex items-end justify-between">
            <div className="flex flex-col gap-1">
              <span
                className="text-xs font-semibold tracking-[0.2em] uppercase"
                style={{ color: "#A8A29E" }}
              >
                Sold For
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[48px] leading-none font-bold" style={{ color: "#1C1C1C" }}>
                  {player.soldPoints?.toLocaleString() || 0}
                </span>
                <span className="text-base font-medium uppercase" style={{ color: "#A8A29E" }}>
                  pts
                </span>
              </div>
            </div>
          </div>

          <div className="h-px w-full" style={{ backgroundColor: "#E5E2DB" }} />

          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-14 shrink-0 object-contain"
              />
            ) : (
              <div
                className="flex size-14 shrink-0 items-center justify-center text-lg font-bold uppercase"
                style={{ backgroundColor: "#ECEAE5", color: "#1C1C1C" }}
              >
                {team.name.slice(0, 2)}
              </div>
            )}
            <div className="flex flex-col">
              <span
                className="text-xs font-semibold tracking-[0.15em] uppercase"
                style={{ color: "#A8A29E" }}
              >
                Acquired By
              </span>
              <h3
                className="text-2xl font-semibold tracking-wide uppercase"
                style={{ color: "#1C1C1C" }}
              >
                {team.name}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. CYBERPUNK VARIANT — Asymmetric Diagonal Layout
function PlayerSoldCardCyberpunk({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Courier New', Courier, monospace",
        backgroundColor: "#0C0A1A",
      }}
      className="relative flex shrink-0 overflow-hidden select-none"
    >
      {/* Scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-30"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* Glow blobs */}
      <div
        className="absolute top-0 left-0 size-[500px] rounded-full blur-[200px]"
        style={{ backgroundColor: "rgba(173,255,47,0.08)" }}
      />
      <div
        className="absolute right-0 bottom-0 size-[400px] rounded-full blur-[180px]"
        style={{ backgroundColor: "rgba(255,20,147,0.08)" }}
      />

      {/* Left ~45% — Player image with clipped/skewed right edge */}
      <div
        className="relative z-10 shrink-0"
        style={{
          width: "48%",
          clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)",
        }}
      >
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            priority
            className="absolute inset-0 size-full object-contain"
            style={{ filter: "saturate(0.6) contrast(1.2)" }}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{ backgroundColor: "#12102A" }}
          >
            <StarIcon className="size-24" style={{ color: "#ADFF2F" }} />
          </div>
        )}
        {/* Diagonal stripe accent */}
        <div
          className="absolute right-0 bottom-0 z-20"
          style={{
            width: "80px",
            height: "100%",
            background:
              "linear-gradient(175deg, transparent 0%, transparent 40%, #ADFF2F 40%, #ADFF2F 42%, transparent 42%, transparent 55%, #FF1493 55%, #FF1493 57%, transparent 57%)",
            clipPath: "polygon(0 0, 100% 0, 82% 100%, 0 100%)",
          }}
        />
      </div>

      {/* Right side — Stacked HUD panels */}
      <div className="relative z-10 flex flex-1 flex-col justify-between py-6 pr-8 pl-2">
        {/* Top panel: Auction */}
        <div
          className="flex items-center gap-4 border-b px-6 py-5"
          style={{ borderColor: "rgba(173,255,47,0.2)" }}
        >
          <ZapIcon className="size-6 shrink-0" style={{ color: "#ADFF2F" }} />
          <div className="flex flex-col">
            <span
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "#FF1493" }}
            >
              SYS::AUCTION
            </span>
            <h2
              className="text-xl font-bold tracking-widest uppercase"
              style={{ color: "#ADFF2F" }}
            >
              {auction.name}
            </h2>
          </div>
        </div>

        {/* Middle panel: Player name + skills + category */}
        <div className="flex flex-1 flex-col justify-center gap-4 px-6 py-4">
          <span
            className="inline-flex w-fit items-center px-3 py-1 text-xs font-bold tracking-widest uppercase"
            style={{
              backgroundColor: "rgba(173,255,47,0.1)",
              border: "1px solid rgba(173,255,47,0.3)",
              color: "#ADFF2F",
            }}
          >
            {player.category?.name || "N/A"}
          </span>
          <h1
            className="text-[52px] leading-[1] font-black uppercase"
            style={{
              color: "transparent",
              backgroundImage: "linear-gradient(135deg, #ADFF2F 0%, #FFFFFF 50%, #FF1493 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
            }}
          >
            {player.name}
          </h1>
          <span
            className="text-lg font-bold tracking-[0.2em] uppercase"
            style={{ color: "#FF1493" }}
          >
            {player.skills}
          </span>
          {/* Decorative HUD line */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1" style={{ backgroundColor: "rgba(173,255,47,0.3)" }} />
            <span
              className="text-[9px] tracking-[0.3em] uppercase"
              style={{ color: "rgba(173,255,47,0.5)" }}
            >
              CONFIRMED
            </span>
            <div className="h-px w-8" style={{ backgroundColor: "rgba(255,20,147,0.3)" }} />
          </div>
        </div>

        {/* Bottom panel: Team + Price side by side */}
        <div className="flex border-t" style={{ borderColor: "rgba(255,20,147,0.2)" }}>
          {/* Team */}
          <div
            className="flex flex-1 flex-col justify-center gap-2 border-r px-6 py-5"
            style={{ borderColor: "rgba(173,255,47,0.15)" }}
          >
            <span
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "#FF1493" }}
            >
              NEW OWNER
            </span>
            <div className="flex items-center gap-3">
              {team.logoUrl ? (
                <LazyImage
                  src={team.logoUrl}
                  alt={team.name}
                  priority
                  className="size-12 shrink-0 object-contain"
                  style={{ filter: "drop-shadow(0 0 6px rgba(173,255,47,0.4))" }}
                />
              ) : (
                <div
                  className="flex size-12 shrink-0 items-center justify-center text-base font-bold"
                  style={{
                    border: "1px solid #ADFF2F",
                    backgroundColor: "rgba(173,255,47,0.1)",
                    color: "#ADFF2F",
                  }}
                >
                  {team.name.slice(0, 2)}
                </div>
              )}
              <h3
                className="text-xl font-black tracking-wider uppercase"
                style={{ color: "#FFFFFF" }}
              >
                {team.name}
              </h3>
            </div>
          </div>

          {/* Price */}
          <div className="flex flex-1 flex-col items-end justify-center gap-1 px-6 py-5">
            <span
              className="text-[10px] font-bold tracking-[0.3em] uppercase"
              style={{ color: "#ADFF2F" }}
            >
              CREDITS
            </span>
            <div className="flex items-end gap-2">
              <span
                className="text-[48px] leading-none font-black"
                style={{
                  color: "#ADFF2F",
                  textShadow: "0 0 20px rgba(173,255,47,0.4)",
                }}
              >
                {player.soldPoints?.toLocaleString() || 0}
              </span>
              <span className="mb-1 text-base font-bold" style={{ color: "rgba(173,255,47,0.6)" }}>
                PTS
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 4. TRADING CARD VARIANT — Full-Bleed Portrait Layout
function PlayerSoldCardTradingCard({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        backgroundColor: "#F5F0E1",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Matte black outer border */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ border: "10px solid #1A1A1A" }}
      />

      {/* Top ~55% — Full-bleed player image */}
      <div className="relative" style={{ height: "55%" }}>
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            priority
            className="absolute inset-0 size-full object-contain object-top"
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{ backgroundColor: "#E8E0CC" }}
          >
            <ShieldIcon className="size-36" style={{ color: "#6B1D2A" }} />
          </div>
        )}

        {/* Gradient fade at bottom of image */}
        <div
          className="absolute right-0 bottom-0 left-0"
          style={{
            height: "120px",
            background: "linear-gradient(to top, #F5F0E1 0%, transparent 100%)",
          }}
        />

        {/* Auction badge top-left */}
        <div
          className="absolute top-6 left-6 z-10 flex items-center gap-3 px-4 py-2"
          style={{ backgroundColor: "rgba(26,26,26,0.85)" }}
        >
          <Logo
            src={auction.logoUrl}
            className="size-8 shrink-0 object-contain"
            iconClassName="size-4"
          />
          <span
            className="text-xs font-bold tracking-[0.15em] uppercase"
            style={{ color: "#F5F0E1" }}
          >
            {auction.name}
          </span>
        </div>

        {/* Team badge — circular, top-right corner */}
        <div
          className="absolute top-6 right-6 z-10 flex size-28 items-center justify-center overflow-hidden rounded-full shadow-xl"
          style={{
            backgroundColor: "#F5F0E1",
            border: "5px solid #6B1D2A",
          }}
        >
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-20 object-contain"
            />
          ) : (
            <span className="text-2xl font-black" style={{ color: "#6B1D2A" }}>
              {team.name.slice(0, 2)}
            </span>
          )}
        </div>
      </div>

      {/* Bottom ~45% — Card info panel */}
      <div
        className="relative z-10 flex flex-1 flex-col justify-between px-14 pt-4 pb-14"
        style={{ backgroundColor: "#F5F0E1" }}
      >
        {/* Thick burgundy top rule */}
        <div className="mb-6 h-1.5 w-full" style={{ backgroundColor: "#6B1D2A" }} />

        <div className="flex flex-1 flex-col justify-between">
          {/* Player name — bold italic */}
          <div className="flex flex-col gap-2">
            <h1
              className="text-[64px] leading-[1.05] font-black uppercase italic"
              style={{ color: "#1A1A1A" }}
            >
              {player.name}
            </h1>
            <div className="flex items-center gap-4">
              <span
                className="inline-flex items-center px-4 py-1.5 text-sm font-bold tracking-[0.15em] uppercase"
                style={{
                  backgroundColor: "#6B1D2A",
                  color: "#F5F0E1",
                }}
              >
                {player.category?.name || "CATEGORY"}
              </span>
              <span
                className="text-lg font-normal tracking-[0.1em] uppercase"
                style={{ color: "#6B1D2A" }}
              >
                {player.skills}
              </span>
            </div>
          </div>

          {/* Sold price + team row */}
          <div className="flex flex-col gap-4">
            <div className="h-px w-full" style={{ backgroundColor: "#1A1A1A" }} />
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-4">
                {team.logoUrl ? (
                  <LazyImage
                    src={team.logoUrl}
                    alt={team.name}
                    priority
                    className="size-16 shrink-0 object-contain"
                  />
                ) : (
                  <div
                    className="flex size-16 shrink-0 items-center justify-center text-xl font-bold uppercase"
                    style={{ backgroundColor: "#6B1D2A", color: "#F5F0E1" }}
                  >
                    {team.name.slice(0, 2)}
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className="text-xs font-bold tracking-[0.2em] uppercase"
                    style={{ color: "#6B1D2A" }}
                  >
                    Acquired By
                  </span>
                  <h3
                    className="text-3xl font-black tracking-wide uppercase"
                    style={{ color: "#1A1A1A" }}
                  >
                    {team.name}
                  </h3>
                </div>
              </div>

              <div className="flex flex-col items-end">
                <span
                  className="text-xs font-bold tracking-[0.2em] uppercase"
                  style={{ color: "#6B1D2A" }}
                >
                  Sold For
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-[56px] leading-none font-black"
                    style={{ color: "#1A1A1A" }}
                  >
                    {player.soldPoints?.toLocaleString() || 0}
                  </span>
                  <span className="text-xl font-bold uppercase" style={{ color: "#6B1D2A" }}>
                    pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 5. ELEGANT VARIANT — Centered Editorial Layout
function PlayerSoldCardElegant({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Playfair Display', Georgia, serif",
        backgroundColor: "#0B1026",
      }}
      className="relative flex shrink-0 flex-col items-center overflow-hidden select-none"
    >
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(201,168,76,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Thin gold border inset */}
      <div
        className="pointer-events-none absolute inset-8 z-0"
        style={{ border: "1px solid rgba(201,168,76,0.2)" }}
      />

      {/* Auction name — small, top center */}
      <div className="z-10 flex flex-col items-center pt-20 pb-4">
        <Logo
          src={auction.logoUrl}
          className="mb-3 size-12 object-contain opacity-70"
          iconClassName="size-6"
        />
        <span
          className="text-xs font-normal tracking-[0.4em] uppercase"
          style={{ color: "#C9A84C" }}
        >
          {auction.name}
        </span>
      </div>

      {/* Centered content */}
      <div className="z-10 flex flex-1 flex-col items-center justify-center px-16">
        {/* Large circular portrait with gold ring */}
        <div
          className="relative mb-10 flex size-80 items-center justify-center rounded-full"
          style={{
            border: "3px solid #C9A84C",
            boxShadow: "0 0 40px rgba(201,168,76,0.1)",
          }}
        >
          <div
            className="size-[calc(100%-12px)] overflow-hidden rounded-full"
            style={{ backgroundColor: "#131838" }}
          >
            {player.imageUrl ? (
              <LazyImage
                src={player.imageUrl}
                alt={player.name}
                priority
                className="size-full object-contain"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <CrownIcon className="size-20" style={{ color: "rgba(201,168,76,0.4)" }} />
              </div>
            )}
          </div>
        </div>

        {/* Player name — large serif */}
        <h1
          className="mb-3 text-center text-[60px] leading-[1.1] font-normal tracking-wide uppercase"
          style={{ color: "#F5F1E8" }}
        >
          {player.name}
        </h1>

        {/* Skills & category */}
        <div className="flex items-center gap-4">
          <span className="h-px w-10" style={{ backgroundColor: "rgba(201,168,76,0.4)" }} />
          <span
            className="text-base font-normal tracking-[0.2em] uppercase"
            style={{ color: "#C9A84C" }}
          >
            {player.skills}
          </span>
          <span className="h-px w-10" style={{ backgroundColor: "rgba(201,168,76,0.4)" }} />
        </div>
        <span
          className="mt-3 text-xs font-normal tracking-[0.3em] uppercase"
          style={{ color: "rgba(201,168,76,0.5)" }}
        >
          {player.category?.name || "ELITE"}
        </span>

        {/* Horizontal gold divider */}
        <div className="my-10 h-px w-64" style={{ backgroundColor: "#C9A84C" }} />

        {/* Bottom row: Team | Gold divider | Price — symmetrically flanking center */}
        <div className="flex items-center gap-10">
          {/* Team (left) */}
          <div className="flex flex-col items-end gap-1 text-right" style={{ minWidth: "200px" }}>
            <span
              className="text-[10px] font-normal tracking-[0.3em] uppercase"
              style={{ color: "rgba(201,168,76,0.6)" }}
            >
              Acquired By
            </span>
            <div className="flex items-center gap-3">
              {team.logoUrl ? (
                <LazyImage
                  src={team.logoUrl}
                  alt={team.name}
                  priority
                  className="size-10 shrink-0 object-contain"
                />
              ) : null}
              <span
                className="text-2xl font-normal tracking-wider uppercase"
                style={{ color: "#F5F1E8" }}
              >
                {team.name}
              </span>
            </div>
          </div>

          {/* Gold vertical divider */}
          <div className="h-16 w-px" style={{ backgroundColor: "#C9A84C" }} />

          {/* Sold price (right) */}
          <div className="flex flex-col items-start gap-1 text-left" style={{ minWidth: "200px" }}>
            <span
              className="text-[10px] font-normal tracking-[0.3em] uppercase"
              style={{ color: "rgba(201,168,76,0.6)" }}
            >
              Sold For
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-[40px] leading-none font-normal" style={{ color: "#F5F1E8" }}>
                {player.soldPoints?.toLocaleString() || 0}
              </span>
              <span className="text-sm font-normal uppercase" style={{ color: "#C9A84C" }}>
                Points
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 6. BREAKING NEWS VARIANT — TV News Broadcast Style
function PlayerSoldCardBreakingNews({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Arial Black', 'Helvetica Neue', Arial, sans-serif",
        backgroundColor: "#1A1A2E",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Scan lines overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-40"
        style={{
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 3px)",
        }}
      />

      {/* BREAKING NEWS ticker banner */}
      <div
        className="relative z-30 flex h-24 shrink-0 items-center overflow-hidden"
        style={{ backgroundColor: "#DC2626" }}
      >
        <div className="flex w-full items-center justify-between px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 items-center px-5" style={{ backgroundColor: "#FFFFFF" }}>
              <span
                className="text-2xl font-black tracking-[0.1em] uppercase"
                style={{ color: "#DC2626" }}
              >
                BREAKING
              </span>
            </div>
            <span className="text-3xl font-black tracking-[0.15em] text-white uppercase">
              BREAKING NEWS
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className="size-3 rounded-full"
              style={{ backgroundColor: "#FFFFFF", animation: "pulse 1s infinite" }}
            />
            <span className="text-sm font-bold tracking-widest text-white/80 uppercase">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main content — 16:9 letterbox frame with player image */}
      <div className="relative z-10 flex flex-1 flex-col">
        {/* Player image in 16:9 letterbox */}
        <div className="relative flex flex-1 items-center justify-center px-10 py-6">
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: "16/9",
              maxHeight: "480px",
              backgroundColor: "#0F0F23",
              border: "3px solid #333355",
            }}
          >
            {player.imageUrl ? (
              <LazyImage
                src={player.imageUrl}
                alt={player.name}
                priority
                className="absolute inset-0 size-full object-contain"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <StarIcon className="size-24" style={{ color: "#333355" }} />
              </div>
            )}
            {/* Network bug top-right */}
            <div
              className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5"
              style={{ backgroundColor: "rgba(26,26,46,0.85)" }}
            >
              <Logo
                src={auction.logoUrl}
                className="size-6 shrink-0 object-contain"
                iconClassName="size-3"
              />
              <span className="text-xs font-bold tracking-wider text-white/70 uppercase">
                {auction.name}
              </span>
            </div>
          </div>
        </div>

        {/* Lower-third chyron overlay */}
        <div className="absolute right-0 bottom-24 left-0 z-20 px-10">
          <div
            className="flex flex-col overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(220,38,38,0.95) 0%, rgba(185,28,28,0.95) 100%)",
            }}
          >
            <div className="px-8 py-4">
              <h1 className="text-[48px] leading-[1.1] font-black tracking-wide text-white uppercase">
                {player.name}
              </h1>
            </div>
            <div
              className="flex items-center gap-6 px-8 py-3"
              style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            >
              <span className="text-base font-bold tracking-widest text-white/90 uppercase">
                {player.category?.name || "PLAYER"}
              </span>
              <div className="h-4 w-px bg-white/30" />
              <span className="text-base font-normal tracking-wider text-white/80 uppercase">
                {player.skills}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom news crawl / ticker */}
      <div
        className="relative z-30 flex h-20 shrink-0 items-center overflow-hidden"
        style={{ backgroundColor: "#111128" }}
      >
        <div
          className="flex h-full w-28 shrink-0 items-center justify-center"
          style={{ backgroundColor: "#DC2626" }}
        >
          <span className="text-xs font-black tracking-widest text-white uppercase">UPDATE</span>
        </div>
        <div className="flex items-center gap-6 overflow-hidden px-8">
          <span className="shrink-0 text-xl font-bold text-white">
            {player.name} SOLD FOR {player.soldPoints?.toLocaleString() || 0} POINTS
          </span>
          <span className="shrink-0 text-lg text-white/50">•</span>
          <span className="shrink-0 text-xl font-bold" style={{ color: "#DC2626" }}>
            ACQUIRED BY {team.name.toUpperCase()}
          </span>
          <span className="shrink-0 text-lg text-white/50">•</span>
          <span className="shrink-0 text-xl font-normal text-white/70">TRANSFER CONFIRMED</span>
        </div>
      </div>
    </div>
  );
}

// 7. RECEIPT VARIANT — Transaction Receipt / Ticket Stub
function PlayerSoldCardReceipt({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Courier New', Courier, monospace",
        backgroundColor: "#E8E4DC",
      }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden select-none"
    >
      {/* Receipt paper */}
      <div
        className="relative flex flex-col overflow-hidden"
        style={{
          width: "680px",
          height: "960px",
          backgroundColor: "#FFF8F0",
          boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        {/* Zigzag top border */}
        <div
          className="h-5 w-full shrink-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, #FFF8F0 10px, #FFF8F0 20px), repeating-linear-gradient(90deg, #E8E4DC 0px, #E8E4DC 10px, transparent 10px, transparent 20px)",
            backgroundSize: "20px 10px, 20px 10px",
            backgroundPosition: "0 0, 10px 10px",
          }}
        />

        {/* Content */}
        <div className="flex flex-1 flex-col px-14 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center gap-3">
            <Logo
              src={auction.logoUrl}
              className="mb-1 size-16 object-contain opacity-50 grayscale"
              iconClassName="size-8"
            />
            <h2
              className="text-center text-2xl font-bold tracking-[0.3em] uppercase"
              style={{ color: "#1A1A1A" }}
            >
              TRANSACTION RECEIPT
            </h2>
            <span className="text-xs tracking-[0.2em] uppercase" style={{ color: "#999" }}>
              {auction.name}
            </span>
            <div className="h-px w-full" style={{ borderTop: "2px dashed #CCCCBB" }} />
          </div>

          {/* Line items */}
          <div className="flex flex-1 flex-col gap-5">
            {/* Player Name */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "#999" }}>
                PLAYER NAME
              </span>
              <span
                className="text-[32px] leading-tight font-bold uppercase"
                style={{ color: "#1A1A1A" }}
              >
                {player.name}
              </span>
              <div className="h-px w-full" style={{ borderTop: "1px dotted #CCCCBB" }} />
            </div>

            {/* Category */}
            <div className="flex items-center justify-between">
              <span className="text-sm tracking-[0.2em] uppercase" style={{ color: "#999" }}>
                CATEGORY
              </span>
              <span className="text-lg font-bold uppercase" style={{ color: "#1A1A1A" }}>
                {player.category?.name || "N/A"}
              </span>
            </div>
            <div className="h-px w-full" style={{ borderTop: "1px dotted #CCCCBB" }} />

            {/* Skills */}
            <div className="flex items-center justify-between">
              <span className="text-sm tracking-[0.2em] uppercase" style={{ color: "#999" }}>
                SKILLS
              </span>
              <span
                className="max-w-[300px] text-right text-base font-bold uppercase"
                style={{ color: "#1A1A1A" }}
              >
                {player.skills}
              </span>
            </div>
            <div className="h-px w-full" style={{ borderTop: "1px dotted #CCCCBB" }} />

            {/* Player image — small thumbnail */}
            <div className="my-2 flex justify-center">
              <div
                className="size-28 overflow-hidden"
                style={{
                  border: "2px solid #CCCCBB",
                  filter: "grayscale(70%) contrast(1.1)",
                }}
              >
                {player.imageUrl ? (
                  <LazyImage
                    src={player.imageUrl}
                    alt={player.name}
                    priority
                    className="size-full object-contain"
                  />
                ) : (
                  <div
                    className="flex size-full items-center justify-center"
                    style={{ backgroundColor: "#EEEADD" }}
                  >
                    <StarIcon className="size-10" style={{ color: "#CCCCBB" }} />
                  </div>
                )}
              </div>
            </div>

            {/* Dashed separator */}
            <div className="my-2 h-px w-full" style={{ borderTop: "3px dashed #1A1A1A" }} />

            {/* TOTAL */}
            <div className="flex items-end justify-between">
              <span
                className="text-2xl font-bold tracking-[0.2em] uppercase"
                style={{ color: "#1A1A1A" }}
              >
                TOTAL
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-[48px] leading-none font-black" style={{ color: "#1A1A1A" }}>
                  {player.soldPoints?.toLocaleString() || 0}
                </span>
                <span className="text-lg font-bold uppercase" style={{ color: "#999" }}>
                  PTS
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto flex flex-col items-center gap-3 pt-4">
              <div className="h-px w-full" style={{ borderTop: "1px dotted #CCCCBB" }} />
              <div className="flex w-full items-center justify-between">
                <span className="text-sm tracking-[0.15em] uppercase" style={{ color: "#999" }}>
                  BUYER
                </span>
                <div className="flex items-center gap-3">
                  {team.logoUrl ? (
                    <LazyImage
                      src={team.logoUrl}
                      alt={team.name}
                      priority
                      className="size-8 shrink-0 object-contain"
                      style={{ filter: "grayscale(60%)" }}
                    />
                  ) : null}
                  <span className="text-lg font-bold uppercase" style={{ color: "#1A1A1A" }}>
                    {team.name}
                  </span>
                </div>
              </div>

              {/* AUTHORIZED stamp */}
              <div
                className="mt-3 flex items-center justify-center px-6 py-2"
                style={{
                  border: "3px solid #C53030",
                  transform: "rotate(-3deg)",
                  color: "#C53030",
                }}
              >
                <span className="text-2xl font-black tracking-[0.3em] uppercase">AUTHORIZED</span>
              </div>

              {/* Barcode decoration */}
              <div className="mt-4 flex h-12 w-3/4 items-end justify-center gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0"
                    style={{
                      width: i % 3 === 0 ? "3px" : "2px",
                      height: `${28 + (i % 5) * 5}px`,
                      backgroundColor: "#1A1A1A",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Zigzag bottom border */}
        <div
          className="h-5 w-full shrink-0"
          style={{
            background:
              "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, #FFF8F0 10px, #FFF8F0 20px), repeating-linear-gradient(90deg, #E8E4DC 0px, #E8E4DC 10px, transparent 10px, transparent 20px)",
            backgroundSize: "20px 10px, 20px 10px",
            backgroundPosition: "0 0, 10px 10px",
            transform: "rotate(180deg)",
          }}
        />
      </div>
    </div>
  );
}

// 8. MOVIE POSTER VARIANT — Cinematic Movie Poster
function PlayerSoldCardMoviePoster({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        backgroundColor: "#000000",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Full-bleed player image */}
      <div className="absolute inset-0 z-0">
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            priority
            className="size-full object-contain"
            style={{ filter: "brightness(0.7) contrast(1.15)" }}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center"
            style={{ backgroundColor: "#0A0A0A" }}
          >
            <StarIcon className="size-48" style={{ color: "#1A1A1A" }} />
          </div>
        )}
      </div>

      {/* Heavy dark vignette overlay */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at 50% 40%, transparent 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 80%, rgba(0,0,0,0.98) 100%)",
        }}
      />
      {/* Bottom gradient for text readability */}
      <div
        className="absolute right-0 bottom-0 left-0 z-10"
        style={{
          height: "60%",
          background:
            "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 40%, transparent 100%)",
        }}
      />

      {/* Category genre badge — top left */}
      <div className="relative z-20 p-12">
        <span
          className="inline-flex items-center px-5 py-2 text-sm font-bold tracking-[0.25em] uppercase"
          style={{
            backgroundColor: "rgba(212,165,116,0.15)",
            border: "1px solid rgba(212,165,116,0.4)",
            color: "#D4A574",
            backdropFilter: "blur(8px)",
          }}
        >
          {player.category?.name || "FEATURED"}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Bottom content — cinematic text */}
      <div className="relative z-20 flex flex-col items-center px-14 pb-16">
        {/* Player name — MASSIVE */}
        <h1
          className="mb-4 text-center leading-[0.95] font-black tracking-[0.04em] text-white uppercase"
          style={{
            fontSize: "clamp(60px, 8vw, 96px)",
            textShadow: "0 4px 40px rgba(0,0,0,0.8)",
          }}
        >
          {player.name}
        </h1>

        {/* Skills as tagline */}
        <span
          className="mb-2 text-center text-xl font-normal tracking-[0.2em] uppercase"
          style={{ color: "rgba(255,255,255,0.6)" }}
        >
          {player.skills}
        </span>

        {/* Sold tagline */}
        <div className="mb-10 flex items-center gap-4">
          <div className="h-px w-16" style={{ backgroundColor: "#D4A574" }} />
          <span
            className="text-2xl font-normal tracking-[0.3em] uppercase"
            style={{ color: "#D4A574" }}
          >
            SOLD FOR {player.soldPoints?.toLocaleString() || 0} PTS
          </span>
          <div className="h-px w-16" style={{ backgroundColor: "#D4A574" }} />
        </div>

        {/* Production studio credits — team */}
        <div className="flex flex-col items-center gap-3">
          <div className="h-px w-48" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-10 shrink-0 object-contain"
                style={{ filter: "brightness(1.2)" }}
              />
            ) : null}
            <div className="flex flex-col items-center">
              <span
                className="text-[10px] tracking-[0.4em] uppercase"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                A Production By
              </span>
              <span
                className="text-lg font-normal tracking-[0.25em] uppercase"
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {team.name}
              </span>
            </div>
          </div>
          <span
            className="text-[10px] tracking-[0.3em] uppercase"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            {auction.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// 9. SOCIAL STORY VARIANT — Instagram Story Card
function PlayerSoldCardSocialStory({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1350px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        backgroundColor: "#0A0A0A",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Full-bleed player image background */}
      <div className="absolute inset-0 z-0">
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            priority
            className="size-full object-contain"
            style={{ filter: "brightness(0.55) saturate(1.2)" }}
          />
        ) : (
          <div className="size-full" style={{ backgroundColor: "#1A0A2E" }} />
        )}
      </div>

      {/* Vibrant gradient overlay (purple → pink → orange) */}
      <div
        className="absolute inset-0 z-5"
        style={{
          background:
            "linear-gradient(160deg, rgba(131,58,180,0.5) 0%, rgba(253,29,29,0.35) 40%, rgba(252,176,69,0.4) 100%)",
        }}
      />
      {/* Dark bottom gradient for text */}
      <div
        className="absolute right-0 bottom-0 left-0 z-5"
        style={{
          height: "50%",
          background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
        }}
      />

      {/* Top area — Auction name in frosted pill */}
      <div className="relative z-10 flex items-center justify-center px-8 pt-14">
        <div
          className="flex items-center gap-3 rounded-full px-7 py-3.5"
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Logo
            src={auction.logoUrl}
            className="size-7 shrink-0 object-contain"
            iconClassName="size-4"
          />
          <span className="text-sm font-semibold tracking-wider text-white/90 uppercase">
            {auction.name}
          </span>
        </div>
      </div>

      {/* Center — Player name with glow effect */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12">
        {/* Category badge */}
        <span
          className="mb-5 rounded-full px-5 py-2 text-xs font-bold tracking-[0.25em] uppercase"
          style={{
            backgroundColor: "rgba(255,255,255,0.15)",
            backdropFilter: "blur(10px)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {player.category?.name || "PLAYER"}
        </span>

        <h1
          className="text-center text-[72px] leading-[1] font-black tracking-tight text-white uppercase"
          style={{
            textShadow:
              "0 0 60px rgba(253,29,29,0.5), 0 0 120px rgba(131,58,180,0.3), 0 4px 20px rgba(0,0,0,0.5)",
          }}
        >
          {player.name}
        </h1>

        <span
          className="mt-4 text-center text-lg font-medium tracking-[0.15em] uppercase"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {player.skills}
        </span>
      </div>

      {/* Bottom area */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 pb-14">
        {/* Sold price in large rounded pill/bubble */}
        <div
          className="flex items-center gap-4 rounded-full px-12 py-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(253,29,29,0.6) 0%, rgba(252,176,69,0.6) 100%)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.2)",
            boxShadow: "0 8px 32px rgba(253,29,29,0.3)",
          }}
        >
          <span className="text-xl font-bold tracking-wider text-white/80 uppercase">SOLD FOR</span>
          <span className="text-[52px] leading-none font-black text-white">
            {player.soldPoints?.toLocaleString() || 0}
          </span>
          <span className="text-xl font-bold tracking-wider text-white/80 uppercase">PTS</span>
        </div>

        {/* Team info in frosted strip */}
        <div
          className="flex items-center gap-4 rounded-2xl px-8 py-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}
        >
          {team.logoUrl ? (
            <LazyImage
              src={team.logoUrl}
              alt={team.name}
              priority
              className="size-12 shrink-0 object-contain"
            />
          ) : (
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              {team.name.slice(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-white/50 uppercase">
              Acquired By
            </span>
            <span className="text-xl font-bold tracking-wider text-white uppercase">
              {team.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 10. STATS CARD VARIANT — Top Trumps / Data Stats Card
function PlayerSoldCardStatsCard({ player, team, auction, ref }: PlayerSoldCardProps) {
  const maxPoints = Math.max(player.soldPoints || 0, 1000);
  const fillPercent = Math.min(((player.soldPoints || 0) / maxPoints) * 100, 100);

  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
        backgroundColor: "#0F172A",
      }}
      className="relative flex shrink-0 flex-col overflow-hidden select-none"
    >
      {/* Background watermark — team name */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden text-[200px] leading-none font-black tracking-[0.05em] whitespace-nowrap uppercase"
        style={{ color: "rgba(59,130,246,0.03)" }}
      >
        {team.name}
      </div>

      {/* Top bar — Auction */}
      <div
        className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b px-8"
        style={{ borderColor: "rgba(59,130,246,0.15)" }}
      >
        <div className="flex items-center gap-3">
          <Logo
            src={auction.logoUrl}
            className="size-7 shrink-0 object-contain opacity-60"
            iconClassName="size-4"
          />
          <span
            className="text-xs font-bold tracking-[0.2em] uppercase"
            style={{ color: "rgba(59,130,246,0.5)" }}
          >
            {auction.name}
          </span>
        </div>
        <span
          className="text-xs font-bold tracking-[0.25em] uppercase"
          style={{ color: "rgba(59,130,246,0.4)" }}
        >
          PLAYER STATS
        </span>
      </div>

      {/* Top half — Player image in rounded-rect frame */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-12 py-6">
        <div
          className="relative flex size-80 items-center justify-center overflow-hidden rounded-3xl"
          style={{
            backgroundColor: "#1E293B",
            border: "3px solid rgba(59,130,246,0.25)",
            boxShadow: "0 0 40px rgba(59,130,246,0.08), inset 0 0 40px rgba(0,0,0,0.3)",
          }}
        >
          {player.imageUrl ? (
            <LazyImage
              src={player.imageUrl}
              alt={player.name}
              priority
              className="size-full object-contain"
            />
          ) : (
            <StarIcon className="size-24" style={{ color: "#3B82F6" }} />
          )}
          {/* Hex accent top-right */}
          <div
            className="absolute -top-1 -right-1 flex size-16 items-center justify-center rounded-bl-2xl"
            style={{ backgroundColor: "#3B82F6" }}
          >
            <span className="text-xs font-black text-white">★</span>
          </div>
        </div>

        {/* Player name beside image */}
        <div className="ml-10 flex flex-col gap-3">
          <h1 className="text-[52px] leading-[1] font-black tracking-tight text-white uppercase">
            {player.name}
          </h1>
          <div className="flex items-center gap-3">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-8 shrink-0 object-contain"
              />
            ) : null}
            <span
              className="text-lg font-bold tracking-wider uppercase"
              style={{ color: "rgba(59,130,246,0.7)" }}
            >
              {team.name}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom half — Stats panel */}
      <div
        className="relative z-10 flex shrink-0 flex-col gap-0 border-t"
        style={{
          borderColor: "rgba(59,130,246,0.2)",
          backgroundColor: "rgba(15,23,42,0.9)",
        }}
      >
        {/* Stat rows */}
        {[
          { label: "CATEGORY", value: player.category?.name || "N/A" },
          { label: "SKILLS", value: player.skills },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between border-b px-10 py-5"
            style={{ borderColor: "rgba(59,130,246,0.1)" }}
          >
            <span
              className="text-sm font-bold tracking-[0.25em] uppercase"
              style={{ color: "rgba(59,130,246,0.6)" }}
            >
              {stat.label}
            </span>
            <span className="text-xl font-bold tracking-wide text-white uppercase">
              {stat.value}
            </span>
          </div>
        ))}

        {/* Sold Price — emphasized with bar viz */}
        <div className="flex flex-col gap-3 px-10 py-6">
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-bold tracking-[0.25em] uppercase"
              style={{ color: "#3B82F6" }}
            >
              SOLD PRICE
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="text-[56px] leading-none font-black"
                style={{
                  color: "#3B82F6",
                  textShadow: "0 0 20px rgba(59,130,246,0.3)",
                }}
              >
                {player.soldPoints?.toLocaleString() || 0}
              </span>
              <span className="text-lg font-bold" style={{ color: "rgba(59,130,246,0.5)" }}>
                PTS
              </span>
            </div>
          </div>
          {/* Bar visualization */}
          <div
            className="h-4 w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(59,130,246,0.1)" }}
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${fillPercent}%`,
                background: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)",
                boxShadow: "0 0 12px rgba(59,130,246,0.4)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 11. POLAROID VARIANT — Instant Photo / Polaroid
function PlayerSoldCardPolaroid({ player, team, auction, ref }: PlayerSoldCardProps) {
  return (
    <div
      ref={ref}
      style={{
        width: "1080px",
        height: "1080px",
        fontFamily: "'Georgia', serif",
        backgroundColor: "#F5F5F0",
      }}
      className="relative flex shrink-0 items-center justify-center overflow-hidden select-none"
    >
      {/* Subtle texture dots */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      {/* Polaroid frame */}
      <div
        className="relative flex flex-col"
        style={{
          width: "740px",
          backgroundColor: "#FFFFFF",
          padding: "36px 36px 120px 36px",
          boxShadow: "0 12px 60px rgba(0,0,0,0.15), 0 2px 12px rgba(0,0,0,0.08)",
          transform: "rotate(2deg)",
        }}
      >
        {/* Image area */}
        <div
          className="relative w-full overflow-hidden"
          style={{
            aspectRatio: "1/1",
            backgroundColor: "#FFFEF5",
          }}
        >
          {player.imageUrl ? (
            <LazyImage
              src={player.imageUrl}
              alt={player.name}
              priority
              className="size-full object-contain"
              style={{ filter: "saturate(0.75) brightness(1.05) contrast(0.95)" }}
            />
          ) : (
            <div
              className="flex size-full items-center justify-center"
              style={{ backgroundColor: "#F0EDE5" }}
            >
              <StarIcon className="size-24" style={{ color: "#D4D0C8" }} />
            </div>
          )}

          {/* SOLD stamp overlay */}
          <div
            className="absolute top-8 right-8 z-20 flex items-center justify-center px-8 py-3"
            style={{
              border: "4px solid #C53030",
              transform: "rotate(-12deg)",
              backgroundColor: "rgba(255,255,255,0.85)",
            }}
          >
            <span className="text-[40px] font-black tracking-[0.15em]" style={{ color: "#C53030" }}>
              SOLD
            </span>
          </div>
        </div>

        {/* White border bottom area — handwriting style text */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <h1
            className="text-center text-[36px] leading-snug font-normal italic"
            style={{ color: "#2D2D2D" }}
          >
            {player.name}
          </h1>
          <div className="flex items-center gap-4">
            {team.logoUrl ? (
              <LazyImage
                src={team.logoUrl}
                alt={team.name}
                priority
                className="size-7 shrink-0 object-contain"
                style={{ filter: "grayscale(40%)" }}
              />
            ) : null}
            <span className="text-base font-normal italic" style={{ color: "#888" }}>
              {team.name}
            </span>
            <span className="text-base font-normal" style={{ color: "#BBB" }}>
              •
            </span>
            <span className="text-base font-normal italic" style={{ color: "#888" }}>
              {player.soldPoints?.toLocaleString() || 0} pts
            </span>
          </div>
        </div>
      </div>

      {/* Subtle auction watermark bottom-right */}
      <div className="absolute right-10 bottom-8 z-10 flex items-center gap-2 opacity-30">
        <Logo
          src={auction.logoUrl}
          className="size-6 object-contain grayscale"
          iconClassName="size-3"
        />
        <span className="text-xs font-normal tracking-wider uppercase" style={{ color: "#999" }}>
          {auction.name}
        </span>
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
    case "breaking-news":
      return <PlayerSoldCardBreakingNews {...props} ref={ref} />;
    case "receipt":
      return <PlayerSoldCardReceipt {...props} ref={ref} />;
    case "movie-poster":
      return <PlayerSoldCardMoviePoster {...props} ref={ref} />;
    case "social-story":
      return <PlayerSoldCardSocialStory {...props} ref={ref} />;
    case "stats-card":
      return <PlayerSoldCardStatsCard {...props} ref={ref} />;
    case "polaroid":
      return <PlayerSoldCardPolaroid {...props} ref={ref} />;
    case "default":
    default:
      return <PlayerSoldCardDefault {...props} ref={ref} />;
  }
};

PlayerSoldCard.displayName = "PlayerSoldCard";
