import { Button } from "@repo/ui/components/button";
import { LazyImage } from "@repo/ui/components/lazy-image";

interface AcquiredSquadProps {
  soldToThisTeam: any[];
  auctionId: string;
  revertPlayerMutation: any;
}

export function AcquiredSquad({
  soldToThisTeam,
  auctionId,
  revertPlayerMutation,
}: AcquiredSquadProps) {
  return (
    <div className="flex-1 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-5 flex items-center justify-between border-b border-[#3c3c3c] pb-3">
        <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
          Acquired Squad ({soldToThisTeam.length})
        </h3>
        <span className="text-[10px] text-[#bbbbbb]">Active roster</span>
      </div>

      <div className="gap-y- max-h-[30vh] overflow-y-auto pr-1">
        {soldToThisTeam.map((player: any) => {
          const categoryColor = "border-[#3c3c3c] text-[#bbbbbb] bg-neutral-950";

          return (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-neutral-950 p-3"
            >
              <div className="flex items-center gap-x-2">
                {player.imageUrl ? (
                  <LazyImage
                    src={player.imageUrl}
                    alt={player.name}
                    fallbackText={player.name}
                    className="size-8 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-contain"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[9px] font-bold text-[#bbbbbb]">
                    {player.name.slice(0, 2)}
                  </div>
                )}
                <div>
                  <h4 className="text-[11px] font-black text-white">{player.name}</h4>
                  <span
                    className={`mt-0.5 inline-block rounded-none border border-solid px-1 text-[6px] font-black tracking-[1.5px] uppercase ${categoryColor}`}
                  >
                    {player.category?.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 text-right">
                <div>
                  <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                    {player.status === "captain" ? "Role" : "Acquired at"}
                  </span>
                  <span className="text-xs font-black text-white">
                    {player.status === "captain" ? "TEAM CAPTAIN" : `${player.soldPoints} pts`}
                  </span>
                </div>
                {player.status !== "captain" && (
                  <Button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to revert ${player.name}?`)) {
                        revertPlayerMutation.mutate({ auctionId, playerId: player.id });
                      }
                    }}
                    disabled={revertPlayerMutation.isPending}
                    className="h-6 cursor-pointer rounded-none border border-[#e22718] bg-transparent px-2 text-[8px] font-bold tracking-[1px] text-[#e22718] uppercase hover:bg-[#e22718] hover:text-white disabled:opacity-50"
                  >
                    Revert
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {soldToThisTeam.length === 0 && (
          <p className="py-6 text-center text-[11px] text-slate-600">
            No players acquired yet in active draft.
          </p>
        )}
      </div>
    </div>
  );
}
