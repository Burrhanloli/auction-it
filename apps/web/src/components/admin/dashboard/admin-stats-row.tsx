export function AdminStatsRow({
  total,
  draft,
  live,
  completed,
}: {
  total: number;
  draft: number;
  live: number;
  completed: number;
}) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Total Auctions
        </span>
        <span className="mt-2 block text-4xl font-black text-white">{total}</span>
      </div>
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Draft
        </span>
        <span className="mt-2 block text-4xl font-black text-white">{draft}</span>
      </div>
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[1.5px] text-white uppercase">
          <span className="size-1.5 rounded-full bg-[#0fa336]" />
          Live
        </span>
        <span className="mt-2 block text-4xl font-black text-white">{live}</span>
      </div>
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Completed
        </span>
        <span className="mt-2 block text-4xl font-black text-white">{completed}</span>
      </div>
    </div>
  );
}
