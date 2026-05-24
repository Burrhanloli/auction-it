import { Confetti } from "@repo/ui/components/confetti";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrophyIcon,
  ActivityIcon,
  PlayIcon,
  FlameIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  Volume2Icon,
  Loader2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState, useRef, useEffect } from "react";

import { useLiveAuction } from "#/hooks/use-live-auction";
import { $getAuction, $getAuctionState } from "#/lib/auction-actions";

export const Route = createFileRoute("/auction/$auctionId/live")({
  component: LiveTrackerPage,
});

function LiveTrackerPage() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

  // Queries
  const { data: auction, isLoading: isAuctionLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  const { data: stateData, isLoading: isStateLoading } = useQuery({
    queryKey: ["auction-state", auctionId],
    queryFn: () => $getAuctionState({ data: auctionId }),
  });

  const state = stateData?.state;
  const initialLogs = stateData?.logs ?? [];

  // Local state for streaming logs
  const { logs: realTimeLogs } = useLiveAuction(auctionId);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [isLogsOpen, setIsLogsOpen] = useState(true);
  const [isTeamsOpen, setIsTeamsOpen] = useState(false);

  const activePlayer = state?.currentPlayer;
  const isBiddingActive = state?.stage === "bidding" && activePlayer;

  const [isDrawing, setIsDrawing] = useState(false);
  const prevPlayerIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isBiddingActive && activePlayer?.id && activePlayer.id !== prevPlayerIdRef.current) {
      setIsDrawing(true);
      prevPlayerIdRef.current = activePlayer.id;
      const timer = setTimeout(() => {
        setIsDrawing(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isBiddingActive, activePlayer?.id]);

  const displayLogs = useMemo(() => {
    const mergedLogs = [...realTimeLogs, ...initialLogs];
    const seen = new Set<string>();

    return mergedLogs.filter((log) => {
      const key = `${log.id ?? `${log.auctionId ?? ""}-${log.message}-${log.createdAt}`}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }, [initialLogs, realTimeLogs]);

  if (isAuctionLoading || isStateLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-10 w-10 animate-spin text-white" />
        <span className="text-sm font-semibold tracking-[1.5px] uppercase">
          Connecting Broadcast Stream...
        </span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 h-12 w-12 text-white" />
        <h2 className="mb-2 text-xl font-bold tracking-[1.5px] text-white uppercase">
          Arena Not Found
        </h2>
        <p className="mb-6 text-sm text-[#bbbbbb]">
          The requested auction event key is invalid or has been deleted.
        </p>
        <Link to="/">
          <button className="rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const isSoldCelebration = state?.stage === "sold" && activePlayer;
  const isUnsoldScreen = state?.stage === "unsold" && activePlayer;

  // Find category name
  const categoryName = activePlayer?.category?.name ?? "Player Pool";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans text-white">
      {/* Header bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#3c3c3c] bg-black px-8 py-5">
        <div className="flex items-center space-x-4">
          <Link to="/">
            <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[#bbbbbb] hover:bg-white hover:text-black">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2">
              <TrophyIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                  AUCTION-IT
                </span>
                <span className="text-[10px] font-bold text-[#bbbbbb]">|</span>
                <span className="text-xs font-bold text-[#bbbbbb]">{auction.name}</span>
              </div>
              <span className="flex items-center text-[8px] font-black tracking-[1.5px] text-white uppercase">
                <span className="mr-1 h-1 w-1 animate-ping rounded-none bg-white" />
                &nbsp;Live Broadcast Feed
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Link to="/auction/$auctionId/leaderboard" params={{ auctionId }}>
            <button className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-2 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black">
              Leaderboard Stats
            </button>
          </Link>
        </div>
      </header>

      {/* Main Broadcast Layout */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col space-y-8 px-8 py-10">
        {/* Top Section: Active bidding card viewport */}
        <div className="mx-auto flex w-full max-w-6xl flex-col space-y-6">
          <div className="relative flex min-h-120 flex-1 flex-col items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <AnimatePresence mode="wait">
              {/* STAGE 1: ACTIVE BIDDING */}
              {isBiddingActive && isDrawing && (
                <motion.div
                  key="drawing"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex w-full flex-col items-center space-y-6 text-center"
                >
                  <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-none border border-[#3c3c3c] bg-black text-5xl font-black text-[#bbbbbb]">
                    <motion.div
                      animate={{ y: [0, -400] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.5,
                        ease: "linear",
                      }}
                      className="flex flex-col items-center space-y-8"
                    >
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                      <span>?</span>
                    </motion.div>
                  </div>
                  <div>
                    <h2 className="mb-2 text-2xl font-black tracking-[1.5px] text-white uppercase">
                      Drawing Player...
                    </h2>
                    <p className="text-sm text-[#bbbbbb]">The auctioneer is shuffling the deck</p>
                  </div>
                </motion.div>
              )}
              {isBiddingActive && !isDrawing && (
                <motion.div
                  key="bidding"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex w-full flex-col items-center space-y-6 text-center"
                >
                  {/* Glowing category badge */}
                  <span className="inline-flex items-center rounded-none border border-white bg-white px-3 py-1 text-xs font-bold tracking-[1.5px] text-black uppercase">
                    <FlameIcon className="mr-1 h-4 w-4 animate-pulse" />
                    {categoryName} Category
                  </span>

                  {/* Player Image with dynamic category color glow borders */}
                  <div className="group relative mt-2">
                    {activePlayer.imageUrl ? (
                      <img
                        src={activePlayer.imageUrl}
                        alt={activePlayer.name}
                        className="relative h-32 w-32 rounded-none border border-[#3c3c3c] bg-black object-cover"
                      />
                    ) : (
                      <div className="relative flex h-32 w-32 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-3xl font-black text-[#bbbbbb] uppercase">
                        {activePlayer.name.slice(0, 2)}
                      </div>
                    )}
                  </div>

                  {/* Name and skills */}
                  <div>
                    <h2 className="mb-2 text-3xl font-black tracking-tight text-white">
                      {activePlayer.name}
                    </h2>
                    <span className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      Skills: {activePlayer.skills}
                    </span>
                  </div>

                  {/* Bidding values layout */}
                  <div className="mt-4 grid w-full max-w-md grid-cols-2 gap-4">
                    {/* Left: Base Points */}
                    <div className="flex flex-col items-center justify-center rounded-none border border-[#3c3c3c] bg-black p-4">
                      <span className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Base Price
                      </span>
                      <span className="mt-1 text-lg font-bold text-white">
                        {activePlayer.category?.basePoints} pts
                      </span>
                    </div>

                    {/* Right: Current High Bid */}
                    <div className="flex flex-col items-center justify-center rounded-none border border-white bg-white p-4 text-black">
                      <span className="flex items-center text-[10px] font-black tracking-[1.5px] text-black uppercase">
                        <span className="mr-1 h-1.5 w-1.5 animate-ping rounded-none bg-black" />
                        Current Bid
                      </span>
                      <span className="mt-1 text-2xl font-black text-black">
                        {state.currentBidPoints} pts
                      </span>
                    </div>
                  </div>

                  {/* Winning Bidder Team Box */}
                  <div className="flex w-full max-w-md items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-4">
                    <div className="flex items-center space-x-3">
                      {state.currentHighestBidderTeam ? (
                        <>
                          {state.currentHighestBidderTeam.logoUrl ? (
                            <img
                              src={state.currentHighestBidderTeam.logoUrl}
                              alt={state.currentHighestBidderTeam.name}
                              className="h-10 w-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xs font-bold text-white uppercase">
                              {state.currentHighestBidderTeam.name.slice(0, 2)}
                            </div>
                          )}
                          <div className="text-left">
                            <span className="block text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Leading Bidder
                            </span>
                            <span className="text-sm font-black text-white">
                              {state.currentHighestBidderTeam.name}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center space-x-2.5 text-left">
                          <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb]">
                            👤
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Leading Bidder
                            </span>
                            <span className="text-xs font-semibold text-[#bbbbbb]">
                              Waiting for opening bid...
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex h-8 w-8 items-center justify-center rounded-none border border-white bg-white text-black">
                      <Volume2Icon className="h-4 w-4 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STAGE 2: SOLD CELEBRATION */}
              {isSoldCelebration && (
                <motion.div
                  key="sold"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex w-full flex-col items-center space-y-6 text-center"
                >
                  <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
                    <Confetti
                      className="absolute h-full w-full"
                      options={{
                        particleCount: 150,
                        spread: 70,
                        angle: 60,
                        origin: { x: 0, y: 0.6 },
                      }}
                    />
                    <Confetti
                      className="absolute h-full w-full"
                      options={{
                        particleCount: 150,
                        spread: 70,
                        angle: 120,
                        origin: { x: 1, y: 0.6 },
                      }}
                    />
                  </div>
                  <div className="relative">
                    <motion.span
                      initial={{ scale: 3, opacity: 0, rotate: -15 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      className="inline-flex items-center rounded-none border border-white bg-white px-4 py-1.5 text-sm font-black tracking-[1.5px] text-black uppercase"
                    >
                      🔨 SOLD CELEBRATION 🔨
                    </motion.span>
                  </div>

                  {activePlayer.imageUrl ? (
                    <img
                      src={activePlayer.imageUrl}
                      alt={activePlayer.name}
                      className="mt-2 h-28 w-28 rounded-none border border-white bg-black object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-none border border-white bg-black text-2xl font-black text-white uppercase">
                      {activePlayer.name.slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-4xl font-black text-white">{activePlayer.name}</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
                      Joined the ranks of{" "}
                      <span className="font-bold text-white">
                        {state.currentHighestBidderTeam?.name}
                      </span>{" "}
                      for a spectacular sum of:
                    </p>
                  </div>

                  <div className="rounded-none border border-[#3c3c3c] bg-black px-8 py-4">
                    <span className="block text-[10px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                      Sold Price
                    </span>
                    <span className="text-4xl font-black text-white">
                      {state.currentBidPoints} pts
                    </span>
                  </div>
                </motion.div>
              )}

              {/* STAGE 3: UNSOLD SCREEN */}
              {isUnsoldScreen && (
                <motion.div
                  key="unsold"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex w-full flex-col items-center space-y-6 text-center"
                >
                  <span className="inline-flex items-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-1.5 text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                    💨 UNSOLD 💨
                  </span>

                  {activePlayer.imageUrl ? (
                    <img
                      src={activePlayer.imageUrl}
                      alt={activePlayer.name}
                      className="mt-2 h-28 w-28 rounded-none border border-[#3c3c3c] bg-black object-cover opacity-50"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-2xl font-black text-[#bbbbbb] uppercase">
                      {activePlayer.name.slice(0, 2)}
                    </div>
                  )}

                  <div>
                    <h2 className="text-3xl font-black text-white">{activePlayer.name}</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
                      This player went unsold in this round and returns to the backup selection
                      pool.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* STAGE 4: IDLE / PAUSED */}
              {!activePlayer && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex w-full flex-col items-center space-y-6 text-center"
                >
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-white">
                    <span className="pointer-events-none absolute inset-0 animate-ping rounded-none border border-[#3c3c3c]" />
                    <ClockIcon className="h-8 w-8 animate-pulse text-white" />
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-black text-white">Arena Connection Active</h3>
                    <p className="mx-auto max-w-xs text-sm leading-relaxed text-[#bbbbbb]">
                      Waiting for the Auctioneer to draw the next player roster card from the
                      selection deck...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Middle Section: Collapsible Auction Logs */}
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div className="flex flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 transition-all">
            <button
              onClick={() => setIsLogsOpen(!isLogsOpen)}
              className="group flex w-full cursor-pointer items-center justify-between border-b border-[#3c3c3c] pb-3 hover:opacity-80"
            >
              <div className="flex items-center space-x-3">
                <h3 className="flex items-center text-xs font-black tracking-[1.5px] text-white uppercase">
                  <ActivityIcon className="mr-1.5 h-4 w-4 animate-pulse text-white" />
                  Live Ticker Feed
                </h3>
                <span className="text-[10px] text-[#bbbbbb]">Real-time</span>
              </div>
              {isLogsOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
              )}
            </button>

            <AnimatePresence>
              {isLogsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 max-h-[40vh] space-y-3 overflow-y-auto scroll-smooth pr-1">
                    <AnimatePresence initial={false}>
                      {displayLogs.map((log: any) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-none border border-[#3c3c3c] bg-black p-3 text-xs leading-relaxed text-[#bbbbbb] transition-colors hover:border-white"
                        >
                          <div className="mb-1 flex items-center justify-between text-[8px] text-[#bbbbbb]">
                            <span>SYSTEM EVENT</span>
                            <span>
                              {new Date(log.createdAt).toLocaleTimeString(undefined, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                              })}
                            </span>
                          </div>
                          {log.message}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {displayLogs.length === 0 && (
                      <p className="py-12 text-center text-xs text-[#bbbbbb]">
                        No event records available.
                      </p>
                    )}
                    <div ref={logsEndRef} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Section: Collapsible Team Standings */}
        <div className="mx-auto flex w-full max-w-6xl flex-col">
          <div className="flex flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 transition-all">
            <button
              onClick={() => setIsTeamsOpen(!isTeamsOpen)}
              className="group flex w-full cursor-pointer items-center justify-between border-b border-[#3c3c3c] pb-3 hover:opacity-80"
            >
              <div className="flex items-center space-x-3">
                <h3 className="text-xs font-black tracking-[1.5px] text-white uppercase">
                  Registered Teams
                </h3>
                <span className="text-[10px] text-[#bbbbbb]">
                  {auction.teams?.length ?? 0} total
                </span>
              </div>
              {isTeamsOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-[#bbbbbb] transition-colors group-hover:text-white" />
              )}
            </button>

            <AnimatePresence>
              {isTeamsOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                    {auction.teams?.map((team: any) => (
                      <div
                        key={team.id}
                        className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-3 transition-colors hover:border-white"
                      >
                        <div className="flex items-center space-x-3">
                          {team.logoUrl ? (
                            <img
                              src={team.logoUrl}
                              alt={team.name}
                              className="h-8 w-8 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-xs font-bold text-white uppercase">
                              {team.name.slice(0, 2)}
                            </div>
                          )}
                          <div>
                            <span className="block text-xs font-bold text-white">{team.name}</span>
                            <span className="text-[9px] tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Owner: {team.ownerName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-[9px] font-semibold text-[#bbbbbb] uppercase">
                            Budget Left
                          </span>
                          <span className="text-xs font-black text-white">
                            {team.remainingBudget} pts
                          </span>
                        </div>
                      </div>
                    ))}
                    {(!auction.teams || auction.teams.length === 0) && (
                      <p className="py-6 text-center text-xs text-[#bbbbbb]">
                        No teams registered yet.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      {/* Ticker marquee footer */}
      <footer className="z-20 overflow-hidden border-t border-[#3c3c3c] bg-black py-3 select-none">
        <div className="flex items-center">
          <div className="z-30 flex shrink-0 items-center border-r border-[#3c3c3c] bg-white px-4 py-1.5 text-[10px] font-bold tracking-[1.5px] text-black uppercase">
            <PlayIcon className="mr-1 h-3 w-3 fill-current" />
            Live Arena Stream
          </div>
          <div className="relative flex w-full items-center">
            {/* We'll show a simple horizontal sliding marquee of the latest events */}
            <div className="flex animate-[marquee_30s_linear_infinite] space-x-12 px-6 text-xs font-semibold whitespace-nowrap text-[#bbbbbb] select-none">
              {displayLogs.slice(0, 5).map((log: any, idx: number) => (
                <span key={idx} className="flex items-center space-x-2">
                  <span className="h-1.5 w-1.5 rounded-none bg-white" />
                  <span>{log.message}</span>
                </span>
              ))}
              {displayLogs.length === 0 && <span>Waiting for upcoming player bids...</span>}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
