import { LazyImage } from "@repo/ui/components/lazy-image";
import { StarIcon, TrashIcon } from "lucide-react";

interface WishlistDeckProps {
  wishlistPlayers: any[];
  verifiedTeamId: string;
  handleToggleWishlist: (playerId: string, isWishlisted: boolean) => void;
}

export function WishlistDeck({
  wishlistPlayers,
  verifiedTeamId,
  handleToggleWishlist,
}: WishlistDeckProps) {
  return (
    <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-5 flex items-center justify-between border-b border-[#3c3c3c] pb-4">
        <div>
          <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
            Starred Wishlist Players
          </h3>
          <p className="mt-1 text-[10px] text-[#bbbbbb]">
            Sought-after candidate pool currently unsold
          </p>
        </div>
        <span className="rounded-none border border-[#3c3c3c] bg-neutral-950 px-2.5 py-1 text-[10px] font-bold text-[#bbbbbb]">
          {wishlistPlayers.length} Watchlist Entries
        </span>
      </div>

      <div className="grid max-h-[30vh] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
        {wishlistPlayers.map((player: any) => {
          const isSoldToOthers =
            (player.status === "sold" || player.status === "captain") &&
            player.soldToTeamId !== verifiedTeamId;
          const isSoldToMe =
            (player.status === "sold" || player.status === "captain") &&
            player.soldToTeamId === verifiedTeamId;

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950 p-3 transition-all duration-200 hover:border-white ${
                isSoldToMe ? "opacity-50" : isSoldToOthers ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-center gap-x-2">
                {player.imageUrl ? (
                  <div className="relative shrink-0">
                    <LazyImage
                      src={player.imageUrl}
                      alt={player.name}
                      fallbackText={player.name}
                      className={`size-9 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-contain transition-all ${
                        player.status === "sold" || player.status === "captain"
                          ? "brightness-50 contrast-125 grayscale"
                          : ""
                      }`}
                    />
                    {(player.status === "sold" || player.status === "captain") && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded-none bg-neutral-950/50 backdrop-blur-[0.5px]`}
                      >
                        <span
                          className={`py-0.2 rotate-[-15deg] rounded-none border border-[#3c3c3c] bg-neutral-950 px-0.5 text-[6px] font-black tracking-[1.5px] text-white uppercase`}
                        >
                          {isSoldToMe
                            ? player.status === "captain"
                              ? "CAPTAIN"
                              : "MINE"
                            : player.status === "captain"
                              ? "CAPTAIN"
                              : "SOLD"}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative shrink-0">
                    <div
                      className={`flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[10px] font-bold text-[#bbbbbb] uppercase transition-all ${
                        player.status === "sold" || player.status === "captain"
                          ? "border-[#3c3c3c] bg-neutral-950 text-[#bbbbbb]"
                          : ""
                      }`}
                    >
                      {player.name.slice(0, 2)}
                    </div>
                    {(player.status === "sold" || player.status === "captain") && (
                      <div
                        className={`absolute inset-0 flex items-center justify-center rounded-none bg-neutral-950/50`}
                      >
                        <span
                          className={`py-0.2 rotate-[-15deg] rounded-none border border-[#3c3c3c] bg-neutral-950 px-0.5 text-[6px] font-black tracking-[1.5px] text-white uppercase`}
                        >
                          {isSoldToMe
                            ? player.status === "captain"
                              ? "CAPTAIN"
                              : "MINE"
                            : player.status === "captain"
                              ? "CAPTAIN"
                              : "SOLD"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-x-2">
                    <h4 className="text-xs font-black text-white">{player.name}</h4>
                    <StarIcon className="size-3 fill-white text-white" />
                  </div>
                  <span className="block text-[9px] text-[#bbbbbb]">
                    Category: {player.category?.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-x-2 text-right">
                <div>
                  {isSoldToOthers ? (
                    <div className="space-y-1.5">
                      <span className="block rounded-none border border-white bg-white px-1.5 py-0.5 text-[8px] font-black tracking-[1.5px] text-black uppercase">
                        {player.status === "captain" ? "CAPTAIN" : "SOLD OUT"}
                      </span>
                      <span className="block text-[8px] text-[#bbbbbb]">
                        to {player.soldToTeam?.name}
                      </span>
                    </div>
                  ) : isSoldToMe ? (
                    <span className="block rounded-none border border-white bg-white px-1.5 py-0.5 text-[8px] font-black tracking-[1.5px] text-black uppercase">
                      {player.status === "captain" ? "CAPTAIN" : "ACQUIRED"}
                    </span>
                  ) : (
                    <div className="space-y-1.5">
                      <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Base price
                      </span>
                      <span className="text-[11px] font-black text-white">
                        {player.category?.basePoints} pts
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleWishlist(player.id, true)}
                  className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 p-2 text-white hover:bg-white hover:text-black"
                  title="Remove from Wishlist"
                >
                  <TrashIcon className="size-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {wishlistPlayers.length === 0 && (
          <div className="col-span-2 py-8 text-center text-xs text-slate-600 italic">
            Private Strategy Wishlist is currently empty. Star prospective candidates in the lobby
            below.
          </div>
        )}
      </div>
    </div>
  );
}
