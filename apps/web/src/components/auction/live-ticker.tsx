import { Marquee } from "@repo/ui/components/marquee";
import { PlayIcon } from "lucide-react";

export function LiveTicker({ displayLogs }: { displayLogs: any[] }) {
  return (
    <div className="z-30 overflow-hidden border-b border-[#3c3c3c] bg-neutral-950 py-3 select-none">
      <div className="flex items-center">
        <div className="z-30 flex shrink-0 items-center border-r border-[#3c3c3c] bg-white px-4 py-1.5 text-[10px] font-bold tracking-[1.5px] text-black uppercase">
          <PlayIcon className="mr-1 size-3 fill-current" />
          Live Arena Stream
        </div>
        <div className="relative flex w-full items-center overflow-hidden">
          <Marquee className="text-xs font-semibold whitespace-nowrap text-[#bbbbbb] select-none [--duration:30s] [--gap:3rem]">
            {displayLogs.slice(0, 5).map((log: any) => (
              <span key={log.id} className="flex items-center gap-x-2">
                <span className="size-1.5 rounded-none bg-white" />
                <span>{log.message}</span>
              </span>
            ))}
            {displayLogs.length === 0 && <span>Waiting for upcoming player bids…</span>}
          </Marquee>
        </div>
      </div>
    </div>
  );
}
