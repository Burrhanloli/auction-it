import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader2Icon, ShieldCheckIcon } from "lucide-react";
import { LazyMotion, domAnimation } from "motion/react";
import { useState, useRef, useEffect } from "react";

import { AuctionHero } from "#/components/auction-hero";
import { ActiveBiddingArea, BiddingStatus } from "#/components/auction/live-bidding";
import { LiveHeader } from "#/components/auction/live-header";
import { LiveLogsViewer } from "#/components/auction/live-logs";
import { LiveTicker } from "#/components/auction/live-ticker";
import { PublicAuctionGuard } from "#/components/public-auction-guard";
import { useLiveAuction } from "#/hooks/use-live-auction";
import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { $getAuction, $getAuctionState } from "#/lib/auction-actions";

export const Route = createFileRoute("/auction/$auctionId/fast-live")({
  component: LiveTrackerPage,
});

function LiveTrackerPage() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();
  const { scrollDirection } = useScrollDirection();

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

  // Local state for streaming logs with interval 2000ms
  const { logs: realTimeLogs } = useLiveAuction(auctionId, { intervalMs: 2000 });
  const logsEndRef = useRef<HTMLDivElement>(null);

  const [isLogsOpen, setIsLogsOpen] = useState(true);

  const activePlayer = state?.currentPlayer;
  const isBiddingActive = state?.stage === "bidding" && activePlayer;
  const isCompleted = auction?.status === "completed";

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingPlayerId, setDrawingPlayerId] = useState<string | null>(null);

  if (isBiddingActive && activePlayer?.id && activePlayer.id !== drawingPlayerId) {
    setDrawingPlayerId(activePlayer.id);

    const isFreshDraw =
      !state?.currentHighestBidderTeam &&
      state?.currentBidPoints === activePlayer.category?.basePoints;

    if (isFreshDraw) {
      setIsDrawing(true);
    }
  }

  useEffect(() => {
    if (isDrawing) {
      const timer = setTimeout(() => {
        setIsDrawing(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isDrawing]);

  const displayLogs = (() => {
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
  })();

  if (isAuctionLoading || isStateLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 size-10 animate-spin text-white" />
        <span className="text-sm font-semibold tracking-[1.5px] uppercase">
          Connecting Broadcast Stream…
        </span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 size-12 text-white" />
        <h2 className="mb-2 text-xl font-bold tracking-[1.5px] text-white uppercase">
          Arena Not Found
        </h2>
        <p className="mb-6 text-sm text-[#bbbbbb]">
          The requested auction event key is invalid or has been deleted.
        </p>
        <Link to="/">
          <button
            type="button"
            className="rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
          >
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const isSoldCelebration = state?.stage === "sold" && !!activePlayer;
  const isUnsoldScreen = state?.stage === "unsold" && !!activePlayer;

  // Find category name
  const categoryName = activePlayer?.category?.name ?? "Player Pool";

  let biddingStatus: BiddingStatus = "idle";
  if (isCompleted) {
    biddingStatus = "completed";
  } else if (isDrawing) {
    biddingStatus = "drawing";
  } else if (isBiddingActive) {
    biddingStatus = "bidding";
  } else if (isSoldCelebration) {
    biddingStatus = "sold";
  } else if (isUnsoldScreen) {
    biddingStatus = "unsold";
  }

  return (
    <PublicAuctionGuard auction={auction}>
      <LazyMotion features={domAnimation}>
        <div
          className="flex h-screen w-full flex-col overflow-hidden bg-neutral-950 font-sans text-white"
          data-drawing-player={drawingPlayerId || ""}
        >
          <LiveHeader scrollDirection={scrollDirection} auctionId={auctionId} />
          <LiveTicker displayLogs={displayLogs} />
          <AuctionHero auction={auction} subtitle="Live Broadcast Feed" />

          {/* Main Broadcast Layout */}
          <div className="gap-y- md:gap-y- relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 md:px-8 md:py-10">
            <ActiveBiddingArea
              status={biddingStatus}
              auction={auction}
              activePlayer={activePlayer}
              categoryName={categoryName}
              state={state}
            />
            <LiveLogsViewer
              isLogsOpen={isLogsOpen}
              setIsLogsOpen={setIsLogsOpen}
              displayLogs={displayLogs}
              logsEndRef={logsEndRef}
            />
          </div>
        </div>
      </LazyMotion>
    </PublicAuctionGuard>
  );
}
