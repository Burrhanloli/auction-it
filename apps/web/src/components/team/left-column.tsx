import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { CoinsIcon, UsersIcon } from "lucide-react";

import { ImageViewer } from "#/components/image-viewer";

interface LeftColumnProps {
  team: any;
  auction: any;
  soldToThisTeam: any[];
  spentPoints: number;
}

export function LeftColumn({ team, auction, soldToThisTeam, spentPoints }: LeftColumnProps) {
  const currentSquadSize = soldToThisTeam.length;
  const minSquadSize = auction.minPlayersPerSquad;
  const maxSquadSize = auction.maxPlayersPerSquad;

  const budgetRatio = team.remainingBudget / team.totalBudget;
  const isBudgetLow = team.remainingBudget < 150;
  const budgetGlowColor =
    budgetRatio > 0.5
      ? "bg-white"
      : budgetRatio > 0.2
        ? "bg-[#bbbbbb]"
        : "bg-red-500 animate-pulse";

  return (
    <div className="flex flex-col gap-y-4 lg:col-span-1">
      {/* Team Branding */}
      <div className="relative flex flex-col items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 text-center">
        {team.logoUrl ? (
          <ImageViewer
            src={team.logoUrl}
            alt={team.name}
            className="mb-4 size-32 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain"
          />
        ) : (
          <div className="mb-4 flex size-32 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-4xl font-black text-[#bbbbbb] uppercase">
            {team.name.slice(0, 2)}
          </div>
        )}
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h2 className="text-xl font-black tracking-[1.5px] text-white uppercase">{team.name}</h2>
        </div>
        <p className="mt-1 text-[10px] font-bold text-[#bbbbbb] uppercase">
          Official Strategy Deck
        </p>
      </div>

      {/* Budget Meter */}
      <div className="relative rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <h3 className="mb-6 flex items-center text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
          <CoinsIcon className="mr-2 size-4 text-white" />
          Capital Budget Deck
        </h3>

        <div className="space-y-1.5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-4">
              <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Total Spent
              </span>
              <span className="mt-1 block text-xl font-black text-white">{spentPoints} pts</span>
            </div>
            <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-4">
              <span className="block text-[8px] font-black tracking-[1.5px] text-white uppercase">
                Remaining
              </span>
              <span className="mt-1 block text-xl font-black text-white">
                {team.remainingBudget} pts
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold text-[#bbbbbb]">
              <span>BUDGET EXHAUSTION METER</span>
              <span>{Math.round(budgetRatio * 100)}% Available</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-none border border-[#3c3c3c] bg-neutral-950">
              <div
                className={`h-full rounded-none transition-all duration-500 ${budgetGlowColor}`}
                style={{ width: `${budgetRatio * 100}%` }}
              />
            </div>
          </div>

          {isBudgetLow && (
            <div className="flex items-start gap-x-2 rounded-none border border-red-500 bg-neutral-950 p-3 text-[10px] leading-relaxed font-semibold text-white">
              <span className="self-center text-xs">⚠️</span>
              <span>
                BUDGET CRITICAL! Residual capital drops below 150 points. Pace your upcoming roster
                acquisitions strategically.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Roster Constraints */}
      {(minSquadSize != null ||
        maxSquadSize != null ||
        (auction.categories &&
          auction.categories.some(
            (c: any) => c.minPlayersPerCategory != null || c.maxPlayersPerCategory != null,
          ))) && (
        <div className="relative rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <h3 className="mb-6 flex items-center text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
            <UsersIcon className="mr-2 size-4 text-white" />
            Roster Constraints
          </h3>

          <div className="space-y-1.5">
            {(minSquadSize != null || maxSquadSize != null) && (
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#bbbbbb] uppercase">
                  <span>Total Squad Size</span>
                  <span
                    className={
                      maxSquadSize != null && currentSquadSize > maxSquadSize
                        ? "text-red-500"
                        : "text-white"
                    }
                  >
                    {currentSquadSize} / {maxSquadSize ?? "∞"}
                  </span>
                </div>
                {minSquadSize != null && currentSquadSize < minSquadSize && (
                  <div className="text-[10px] text-yellow-500">
                    ⚠️ Need {minSquadSize - currentSquadSize} more to reach minimum of{" "}
                    {minSquadSize}
                  </div>
                )}
                {maxSquadSize != null && currentSquadSize >= maxSquadSize && (
                  <div className="text-[10px] text-red-500">🚨 Maximum squad size reached!</div>
                )}
              </div>
            )}

            {auction.categories?.map((cat: any) => {
              if (cat.minPlayersPerCategory == null && cat.maxPlayersPerCategory == null)
                return null;
              const catCount = soldToThisTeam.filter((p: any) => p.categoryId === cat.id).length;
              return (
                <div key={cat.id} className="border-t border-[#3c3c3c] pt-2">
                  <div className="mb-2 flex items-center justify-between text-[10px] font-bold text-[#bbbbbb] uppercase">
                    <span>{cat.name}</span>
                    <span
                      className={
                        cat.maxPlayersPerCategory != null && catCount > cat.maxPlayersPerCategory
                          ? "text-red-500"
                          : "text-white"
                      }
                    >
                      {catCount} / {cat.maxPlayersPerCategory ?? "∞"}
                    </span>
                  </div>
                  {cat.minPlayersPerCategory != null && catCount < cat.minPlayersPerCategory && (
                    <div className="text-[10px] text-yellow-500">
                      ⚠️ Need {cat.minPlayersPerCategory - catCount} more (min:{" "}
                      {cat.minPlayersPerCategory})
                    </div>
                  )}
                  {cat.maxPlayersPerCategory != null && catCount >= cat.maxPlayersPerCategory && (
                    <div className="text-[10px] text-red-500">🚨 Max limit reached!</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Franchise Personnel */}
      <div className="relative rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <h3 className="mb-6 text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
          Franchise Executives
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-neutral-950 p-3.5">
            <div className="flex items-center gap-x-2">
              {team.ownerImageUrl ? (
                <ImageViewer
                  src={team.ownerImageUrl}
                  alt={team.ownerName}
                  className="size-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-contain"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] font-bold text-[#bbbbbb]">
                  💼
                </div>
              )}
              <div>
                <span className="block text-xs font-bold text-white">{team.ownerName}</span>
                <span className="mt-0.5 block text-[9px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                  Franchise Owner
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-neutral-950 p-3.5">
            <div className="flex items-center gap-x-2">
              {team.captainPlayer?.imageUrl ? (
                <LazyImage
                  src={team.captainPlayer?.imageUrl}
                  alt={team.captainPlayer?.name}
                  priority
                  fallbackText={team.captainPlayer?.name}
                  className="size-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-contain"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] font-bold text-[#bbbbbb]">
                  👤
                </div>
              )}
              <div>
                <span className="block text-xs font-bold text-white">
                  {team.captainPlayer?.name}
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                  Team Captain
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
