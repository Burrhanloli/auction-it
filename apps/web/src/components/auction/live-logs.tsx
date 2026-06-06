import { ActivityIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { m, AnimatePresence } from "motion/react";
import React from "react";

import { ImageViewer } from "#/components/image-viewer";

export function LiveLogsViewer({
  isLogsOpen,
  setIsLogsOpen,
  displayLogs,
  logsEndRef,
}: {
  isLogsOpen: boolean;
  setIsLogsOpen: (open: boolean) => void;
  displayLogs: any[];
  logsEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col">
      <div className="flex flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 transition-all">
        <button
          type="button"
          onClick={() => setIsLogsOpen(!isLogsOpen)}
          className="group flex w-full cursor-pointer items-center justify-between border-b border-[#3c3c3c] pb-3 hover:opacity-80"
        >
          <div className="flex items-center gap-x-2">
            <h3 className="flex items-center text-xs font-black tracking-[1.5px] text-white uppercase">
              <ActivityIcon className="mr-1.5 size-4 animate-pulse text-white" />
              Live Ticker Feed
            </h3>
            <span className="text-[10px] text-[#bbbbbb]">Real-time</span>
          </div>
          {isLogsOpen ? (
            <ChevronUpIcon className="size-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
          ) : (
            <ChevronDownIcon className="size-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
          )}
        </button>

        <AnimatePresence>
          {isLogsOpen && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 max-h-[70vh] gap-y-4 overflow-y-auto scroll-smooth pr-1">
                <AnimatePresence initial={false}>
                  {displayLogs.map((log: any) => {
                    const isSold = log.actionType === "sold";
                    const isUnsold = log.actionType === "unsold";
                    const baseColor = isSold
                      ? "border-green-500/50 bg-green-500/10 text-green-100"
                      : isUnsold
                        ? "border-red-500/50 bg-red-500/10 text-red-100"
                        : "border-[#3c3c3c] bg-neutral-950 text-[#bbbbbb]";

                    return (
                      <m.div
                        key={log.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`rounded-none border p-3 text-sm leading-relaxed transition-colors ${baseColor}`}
                      >
                        <div className="mb-2 flex items-center justify-between text-[8px] opacity-70">
                          <span>
                            {isSold ? "SOLD EVENT" : isUnsold ? "UNSOLD EVENT" : "SYSTEM EVENT"}
                          </span>
                          <span>
                            {new Date(log.createdAt).toLocaleTimeString(undefined, {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="flex items-start gap-x-2">
                          {isSold && log.team && (
                            <div className="shrink-0">
                              {log.team.logoUrl ? (
                                <ImageViewer
                                  src={log.team.logoUrl}
                                  alt={log.team.name}
                                  className="size-8 rounded-none border border-[#3c3c3c] object-contain"
                                />
                              ) : (
                                <div className="flex size-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[10px] font-bold text-white uppercase">
                                  {log.team.name.slice(0, 2)}
                                </div>
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            {log.message}
                            {isSold && log.team && (
                              <div className="mt-1 text-[10px] font-bold uppercase opacity-80">
                                Winning Team: {log.team.name}
                              </div>
                            )}
                          </div>
                        </div>
                      </m.div>
                    );
                  })}
                </AnimatePresence>
                {displayLogs.length === 0 && (
                  <p className="py-12 text-center text-xs text-[#bbbbbb]">
                    No event records available.
                  </p>
                )}
                <div ref={logsEndRef} />
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
