import { LazyImage } from "@repo/ui/components/lazy-image";

export function ActivePlayerProfile({ activePlayer, categoryColor, state }: any) {
  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-none border border-[#3c3c3c] bg-neutral-950 p-4 md:flex-row">
      <div className="flex items-center gap-x-2">
        {activePlayer.imageUrl ? (
          <LazyImage
            src={activePlayer.imageUrl}
            alt={activePlayer.name}
            priority
            fallbackText={activePlayer.name}
            className="h-24 w-16 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain"
          />
        ) : (
          <div className="flex h-24 w-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-lg font-black text-[#bbbbbb] uppercase">
            {activePlayer.name.slice(0, 2)}
          </div>
        )}
        <div className="text-left">
          <span
            className={`mb-1 inline-block rounded-none border border-solid px-2 py-0.5 text-[8px] font-black tracking-[1.5px] uppercase ${categoryColor}`}
          >
            {activePlayer.category?.name}
          </span>
          <h4 className="text-lg font-black text-white uppercase">{activePlayer.name}</h4>
          <span className="text-[10px] font-bold text-[#bbbbbb]">
            Skills: {activePlayer.skills}
          </span>
        </div>
      </div>

      <div className="flex gap-x-2 text-right md:pr-4">
        <div>
          <span className="block text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
            Base Price
          </span>
          <span className="text-sm font-bold text-white">
            {activePlayer.category?.basePoints} pts
          </span>
        </div>
        <div className="h-8 border-l border-[#3c3c3c]" />
        <div>
          <span className="block text-[9px] font-black tracking-[1.5px] text-white uppercase">
            High Bid
          </span>
          <span className="text-base font-black text-white">{state.currentBidPoints} pts</span>
        </div>
      </div>
    </div>
  );
}
