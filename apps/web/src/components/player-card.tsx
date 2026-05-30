import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { StarIcon } from "lucide-react";
import React from "react";

export function PlayerCard({
  player,
  variant,
  auctionStatus,
  // Admin props
  onEdit,
  onDelete,
  isDeleting,
  // Strategy Lobby props
  isWishlisted,
  onToggleWishlist,
  onMakeCaptain,
}: {
  player: any;
  variant: "admin" | "strategyLobby";
  auctionStatus?: string;
  onEdit?: (player: any) => void;
  onDelete?: (playerId: string) => void;
  isDeleting?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (playerId: string, isWishlisted: boolean) => void;
  onMakeCaptain?: (playerId: string) => void;
}) {
  const categoryName = player.category?.name ?? "Player Pool";
  const isElite = categoryName.toLowerCase() === "elite";
  const isPro = categoryName.toLowerCase() === "pro";

  const glowClass = "border-[#3c3c3c] hover:border-white bg-black";
  const badgeColor = isElite
    ? "border-white text-black bg-white"
    : isPro
      ? "border-[#3c3c3c] text-white bg-[#1a1a1a]"
      : "border-[#3c3c3c] text-[#bbbbbb] bg-black";

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-none border bg-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] ${glowClass} ${
        player.status === "sold" || player.status === "captain"
          ? "opacity-90 hover:border-[#7e7e7e]"
          : ""
      }`}
    >
      {/* Top Section: Compact Full Bleed Image */}
      <div className="relative aspect-[3/4] max-h-64 w-full shrink-0 bg-black">
        {player.imageUrl ? (
          <LazyImage
            src={player.imageUrl}
            alt={player.name}
            fallbackText={player.name}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black text-[48px] font-bold tracking-tight text-white uppercase">
            {player.name.slice(0, 2)}
          </div>
        )}

        {/* Overlay badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span
            className={`inline-flex w-fit items-center rounded-none border px-2 py-0.5 text-[10px] font-bold tracking-[1px] uppercase shadow-lg ${badgeColor}`}
          >
            {categoryName}
          </span>
          {player.status === "sold" ? (
            <span className="inline-flex w-fit items-center rounded-none border border-white bg-white px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-black uppercase shadow-lg">
              SOLD TO {player.soldToTeam?.name}
            </span>
          ) : player.status === "captain" ? (
            <span className="inline-flex w-fit items-center rounded-none border border-white bg-white px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-black uppercase shadow-lg">
              CAPTAIN: {player.soldToTeam?.name}
            </span>
          ) : player.status === "bidding" ? (
            <span className="inline-flex w-fit animate-pulse items-center rounded-none border border-[#3c3c3c] bg-black px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-white uppercase shadow-lg">
              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
              ACTIVE BID
            </span>
          ) : null}
        </div>

        {/* Wishlists - rendering logic based on variant */}
        {variant === "admin" && player.wishlists?.length > 0 && (
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            {player.wishlists.map((w: any) => (
              <div
                key={w.id}
                className="flex items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black/80 px-2 py-0.5 shadow-lg backdrop-blur-sm"
                title={`Wishlisted by ${w.team?.name}`}
              >
                <span className="text-[10px] font-black tracking-[1px] text-yellow-400 uppercase">
                  ⭐
                </span>
                {w.team?.logoUrl ? (
                  <LazyImage
                    src={w.team.logoUrl}
                    alt={w.team.name}
                    fallbackText={w.team.name}
                    className="h-4 w-4 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-bold text-white uppercase">
                    {w.team?.name?.slice(0, 2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {variant === "strategyLobby" && onToggleWishlist && (
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
            <button
              onClick={() => onToggleWishlist(player.id, isWishlisted ?? false)}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border transition-all ${
                isWishlisted
                  ? "border-white bg-white text-black shadow-lg shadow-black/50"
                  : "border-[#3c3c3c] bg-black/80 text-[#bbbbbb] backdrop-blur-sm hover:border-white hover:bg-black hover:text-white"
              }`}
              title={isWishlisted ? "Remove Wishlist Star" : "Add Wishlist Star"}
            >
              <StarIcon className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        )}

        {/* M-Stripe Divider */}
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-4">
          <h4
            className="line-clamp-2 text-[24px] leading-[1.1] font-bold text-white uppercase"
            title={player.name}
          >
            {player.name}
          </h4>
        </div>

        <div className="mt-auto flex flex-col gap-2">
          {variant === "admin" && auctionStatus === "draft" && (
            <div className="flex gap-2 border-t border-[#3c3c3c] pt-2">
              <button
                onClick={() => onEdit?.(player)}
                className="flex h-[28px] flex-1 items-center justify-center border border-white bg-transparent text-[10px] font-bold tracking-[1px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                title="Edit Details"
              >
                Edit Player
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to delete this player?")) {
                    onDelete?.(player.id);
                  }
                }}
                disabled={isDeleting}
                className="flex h-[28px] flex-1 items-center justify-center border border-[#e22718] bg-transparent text-[10px] font-bold tracking-[1px] text-[#e22718] uppercase transition-colors hover:bg-[#e22718] hover:text-white disabled:opacity-50"
                title="Delete Player"
              >
                Delete
              </button>
            </div>
          )}

          {variant === "strategyLobby" && player.status === "unsold" && (
            <div className="flex gap-2 border-t border-[#3c3c3c] pt-2">
              <button
                onClick={() => onMakeCaptain?.(player.id)}
                className="flex h-[28px] flex-1 items-center justify-center border border-white bg-transparent text-[10px] font-bold tracking-[1px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                title="Select as Team Captain"
              >
                Make Captain
              </button>
            </div>
          )}

          {/* Skills */}
          <div className="flex items-start justify-between border-t border-[#3c3c3c] pt-2">
            <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
              Skills
            </span>
            <span className="line-clamp-1 text-right text-[12px] font-light text-[#bbbbbb] uppercase">
              {player.skills}
            </span>
          </div>

          {/* Value Details */}
          <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-2">
            <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
              {player.status === "sold" || player.status === "captain"
                ? "Acquired Value"
                : "Base Value"}
            </span>
            <span className="text-[14px] font-bold tracking-[1px] text-white uppercase">
              {player.status === "sold" || player.status === "captain"
                ? `${player.soldPoints} pts`
                : `${player.category?.basePoints} pts`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
