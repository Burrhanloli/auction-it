import { Button } from "@repo/ui/components/button";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { PlusIcon, FileEditIcon, Loader2Icon, ActivityIcon } from "lucide-react";

import { AuctionCard } from "./auction-card";

export function AdminAuctionsList({
  isLoading,
  liveAuctions,
  draftAuctions,
  completedAuctions,
  totalAuctionsCount,
  onCreateClick,
}: {
  isLoading: boolean;
  liveAuctions: any[];
  draftAuctions: any[];
  completedAuctions: any[];
  totalAuctionsCount: number;
  onCreateClick: () => void;
}) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 size-10 animate-spin text-white" />
        <span className="text-sm font-bold tracking-[1.5px] uppercase">Loading your auctions…</span>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Live Auctions Section */}
      {liveAuctions.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-x-3">
            <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950">
              <ActivityIcon className="size-4 text-white" />
            </div>
            <div>
              <div className="mb-4 inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-xl font-black text-white uppercase">Live Auctions</h2>
              </div>
              <p className="text-xs text-[#bbbbbb]">Currently active — bidding in progress</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {liveAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} badge="live" />
            ))}
          </div>
        </section>
      )}

      {/* Draft Auctions Section */}
      <section>
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-x-3">
            <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950">
              <FileEditIcon className="size-4 text-[#bbbbbb]" />
            </div>
            <div>
              <div className="mb-4 inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-xl font-black text-white uppercase">Draft Auctions</h2>
              </div>
              <p className="text-xs text-[#bbbbbb]">
                Configure teams, players, and settings before going live
              </p>
            </div>
          </div>
          {draftAuctions.length === 0 && totalAuctionsCount > 0 && (
            <span className="text-xs text-[#bbbbbb]">All auctions are live or completed</span>
          )}
        </div>

        {draftAuctions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-20 text-center">
            <div className="flex size-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-2xl">
              🏆
            </div>
            <div>
              <h3 className="text-lg font-bold text-white uppercase">No Draft Auctions</h3>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
                Create your first auction to get started. Configure teams, players, and categories
                before launching.
              </p>
            </div>
            <Button
              onClick={onCreateClick}
              className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-6 font-bold tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
            >
              <PlusIcon className="mr-2 size-4" />
              Create First Auction
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {draftAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} badge="draft" />
            ))}
          </div>
        )}
      </section>

      {/* Completed Auctions Section */}
      {completedAuctions.length > 0 && (
        <section className="mt-8">
          <div className="mb-6 flex items-center gap-x-3">
            <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950">
              <span className="text-sm">🏆</span>
            </div>
            <div>
              <div className="mb-4 inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-xl font-black text-white uppercase">Completed Auctions</h2>
              </div>
              <p className="text-xs text-[#bbbbbb]">
                Finished auctions — ready for roster generation
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {completedAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} badge="completed" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
