import { Input } from "@repo/ui/components/input";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { SearchIcon } from "lucide-react";

import { PlayerCard } from "#/components/player-card";

interface RegistryDraftLobbyProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategoryTab: string;
  setSelectedCategoryTab: (tab: string) => void;
  auction: any;
  filteredUnsoldPlayers: any[];
  wishlistPlayerIds: string[];
  handleToggleWishlist: (playerId: string, isWishlisted: boolean) => void;
  handleSelectCaptain: (playerId: string) => void;
}

export function RegistryDraftLobby({
  searchTerm,
  setSearchTerm,
  selectedCategoryTab,
  setSelectedCategoryTab,
  auction,
  filteredUnsoldPlayers,
  wishlistPlayerIds,
  handleToggleWishlist,
  handleSelectCaptain,
}: RegistryDraftLobbyProps) {
  return (
    <div className="flex-1 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-5 border-b border-[#3c3c3c] pb-4">
        <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
          Registry Draft Lobby
        </h3>
        <p className="mt-1 text-[10px] text-[#bbbbbb]">
          Review active pools, explore stats, and add contenders to wishlist
        </p>
      </div>

      {/* Filters layout */}
      <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <SearchIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
          <Input
            placeholder="Search draft contenders name/skills…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded-none border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
          />
        </div>

        <div className="no-scrollbar flex w-full items-center gap-x-2 overflow-x-auto border-b border-[#3c3c3c] sm:w-auto">
          <button
            type="button"
            onClick={() => setSelectedCategoryTab("all")}
            className={`group relative shrink-0 py-3 text-[14px] font-bold tracking-[1.5px] uppercase transition-colors ${
              selectedCategoryTab === "all" ? "text-white" : "text-[#bbbbbb] hover:text-white"
            }`}
          >
            ALL SESSIONS
            {selectedCategoryTab === "all" && (
              <div className="absolute right-0 bottom-[-1px] left-0 h-[2px] bg-white" />
            )}
            {selectedCategoryTab !== "all" && (
              <MStripeDivider className="absolute right-0 bottom-[-1px] left-0 hidden group-hover:block" />
            )}
          </button>
          {auction.categories?.map((c: any) => (
            <button
              type="button"
              key={c.id}
              onClick={() => setSelectedCategoryTab(c.id)}
              className={`group relative shrink-0 py-3 text-[14px] font-bold tracking-[1.5px] uppercase transition-colors ${
                selectedCategoryTab === c.id ? "text-white" : "text-[#bbbbbb] hover:text-white"
              }`}
            >
              {c.name}
              {selectedCategoryTab === c.id && (
                <div className="absolute right-0 bottom-[-1px] left-0 h-[2px] bg-white" />
              )}
              {selectedCategoryTab !== c.id && (
                <MStripeDivider className="absolute right-0 bottom-[-1px] left-0 hidden group-hover:block" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid max-h-[48vh] grid-cols-1 gap-6 overflow-y-auto pr-1 md:grid-cols-2 lg:max-h-[68vh]">
        {filteredUnsoldPlayers.map((player: any) => {
          const isWishlisted = wishlistPlayerIds.includes(player.id);

          return (
            <PlayerCard
              key={player.id}
              player={player}
              variant="strategyLobby"
              isWishlisted={isWishlisted}
              onToggleWishlist={handleToggleWishlist}
              onMakeCaptain={handleSelectCaptain}
            />
          );
        })}

        {filteredUnsoldPlayers.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-[#bbbbbb]">
              ✨
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Lobby Category Exhausted</h4>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                All players in this category filter have been drafted or match search criteria.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
