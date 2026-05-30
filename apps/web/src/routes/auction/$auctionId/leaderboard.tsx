import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheckIcon,
  ArrowLeftIcon,
  AwardIcon,
  DollarSignIcon,
  Loader2Icon,
  StarIcon,
} from "lucide-react";
import { motion } from "motion/react";

import { AuctionHero } from "#/components/auction-hero";
import { ImageViewer } from "#/components/image-viewer";
import { Logo } from "#/components/logo";
import { PublicAuctionGuard } from "#/components/public-auction-guard";
import { useAuctionSubscription } from "#/hooks/use-auction-subscription";
import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { $getAuction } from "#/lib/auction-actions";

export const Route = createFileRoute("/auction/$auctionId/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { auctionId } = Route.useParams();
  const { scrollDirection } = useScrollDirection();

  // Queries
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  // SSE Real-time Synchronization
  useAuctionSubscription(auctionId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-10 w-10 animate-spin text-white" />
        <span className="text-sm font-semibold tracking-[1.5px] uppercase">
          Connecting Stats Stream...
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
          The requested auction stats deck is invalid or has been deleted.
        </p>
        <Link to="/">
          <button className="rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  // Filter sold players and sort by price descending
  const soldPlayers = (auction.players ?? [])
    .filter((p: any) => p.status === "sold" && p.soldPoints !== null && p.soldToTeamId !== null)
    .sort((a: any, b: any) => (b.soldPoints ?? 0) - (a.soldPoints ?? 0));

  return (
    <PublicAuctionGuard auction={auction}>
      <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans text-white">
        {/* Header */}
        <header
          className={`relative sticky top-0 z-40 flex flex-col justify-between gap-4 border-b border-[#3c3c3c] bg-black px-4 py-4 transition-transform duration-300 ease-in-out md:flex-row md:items-center md:gap-0 md:px-6 ${
            scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
          }`}
        >
          <MStripeDivider className="absolute right-0 bottom-0 left-0" />
          <div className="flex items-center space-x-4">
            <Link to="/auction/$auctionId/live" params={{ auctionId }}>
              <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] hover:bg-white hover:text-black">
                <ArrowLeftIcon className="h-4 w-4" />
              </button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
                <Logo className="h-[18px] w-[18px]" />
              </div>
              <div>
                <span className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                  AUCTION-IT
                </span>
              </div>
            </div>
          </div>

          <Link to="/auction/$auctionId/live" params={{ auctionId }}>
            <button className="flex cursor-pointer items-center justify-center space-x-1.5 rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white">
              <span>Watch Live Event</span>
            </button>
          </Link>
        </header>

        <AuctionHero auction={auction} subtitle="Live Arena Standings & Leaderboards" />

        {/* Main Container */}
        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-12 px-4 py-8 md:px-6 md:py-10">
          {/* SECTION 1: HIGHEST VALUED PLAYERS (TOP RANKINGS) */}
          <div>
            <div className="mb-8 flex items-center">
              <AwardIcon className="mr-3 h-5 w-5 text-white" />
              <div className="inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-xl font-black tracking-[1.5px] text-white uppercase">
                  Highest Valued Players
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#bbbbbb]">
              Top tier player purchases ranked by total points spent
            </p>

            <div className="overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3c3c3c] bg-black text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      <th className="w-16 px-6 py-4 text-center">Rank</th>
                      <th className="px-6 py-4">Player</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Buyer Team</th>
                      <th className="px-6 py-4 pr-8 text-right">Final Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c3c3c]">
                    {soldPlayers.map((player: any, index: number) => {
                      const buyerTeam = auction.teams?.find(
                        (t: any) => t.id === player.soldToTeamId,
                      );
                      const rank = index + 1;
                      const rankStyle =
                        rank === 1
                          ? "bg-white text-black font-black"
                          : rank === 2
                            ? "bg-[#bbbbbb] text-black font-black"
                            : rank === 3
                              ? "bg-[#3c3c3c] text-white font-black"
                              : "bg-black text-[#bbbbbb] border border-[#3c3c3c]";

                      return (
                        <motion.tr
                          key={player.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="transition-colors hover:bg-[#3c3c3c]"
                        >
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-none border border-[#3c3c3c] text-[10px] ${rankStyle}`}
                            >
                              {rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              {player.imageUrl ? (
                                <LazyImage
                                  src={player.imageUrl}
                                  alt={player.name}
                                  fallbackText={player.name}
                                  className="h-8 w-8 rounded-none border border-[#3c3c3c] bg-black object-cover"
                                />
                              ) : (
                                <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-bold text-[#bbbbbb]">
                                  {player.name.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <span className="block text-sm font-bold text-white">
                                  {player.name}
                                </span>
                                <span className="text-[10px] font-medium text-[#bbbbbb]">
                                  Skills: {player.skills}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-none border border-[#3c3c3c] bg-black px-2.5 py-0.5 text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase`}
                            >
                              {player.category?.name}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2.5">
                              {buyerTeam?.logoUrl ? (
                                <ImageViewer
                                  src={buyerTeam.logoUrl}
                                  alt={buyerTeam.name}
                                  className="h-6 w-6 rounded-none border border-[#3c3c3c] bg-black object-cover"
                                />
                              ) : (
                                <div className="flex h-6 w-6 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[9px] font-black text-[#bbbbbb]">
                                  {buyerTeam?.name.slice(0, 2)}
                                </div>
                              )}
                              <span className="font-bold text-white">
                                {buyerTeam?.name ?? "Unknown Team"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 pr-8 text-right">
                            <span className="text-sm font-black text-white">
                              {player.soldPoints} pts
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                    {soldPlayers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-12 text-center font-medium text-[#bbbbbb]">
                          No players have been purchased yet in this arena. Bids will stream here
                          live.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 2: TEAM STANDINGS OVERVIEW */}
          <div>
            <div className="mb-8 flex items-center">
              <DollarSignIcon className="mr-3 h-5 w-5 text-white" />
              <div className="inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-xl font-black tracking-[1.5px] text-white uppercase">
                  Team Roster Standings
                </h2>
              </div>
            </div>
            <p className="mt-1 text-xs text-[#bbbbbb]">
              Roster balance, point distributions, and purchases per registered team
            </p>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {auction.teams?.map((team: any) => {
                const teamPlayers = (auction.players ?? [])
                  .filter((p: any) => p.soldToTeamId === team.id)
                  .sort((a: any, b: any) => {
                    if (team.captainPlayer?.id && team.captainPlayer.id === a.id) return -1;
                    if (team.captainPlayer?.id && team.captainPlayer.id === b.id) return 1;
                    return (b.soldPoints ?? 0) - (a.soldPoints ?? 0);
                  });
                const spentBudget = team.totalBudget - team.remainingBudget;
                const percentSpent = Math.min(
                  100,
                  Math.round((spentBudget / team.totalBudget) * 100),
                );

                return (
                  <div
                    key={team.id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white"
                  >
                    {/* Top Section: Compact Full Bleed Image */}
                    <div className="relative aspect-[3/4] max-h-64 w-full shrink-0 bg-black">
                      {team.logoUrl ? (
                        <ImageViewer
                          src={team.logoUrl}
                          alt={team.name}
                          className="absolute inset-0 h-full w-full object-contain"
                          triggerClassName="absolute inset-0 w-full h-full block"
                        />
                      ) : (
                        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black text-[48px] font-bold tracking-tight text-white uppercase">
                          {team.name.slice(0, 2)}
                        </div>
                      )}
                      {/* M-Stripe Divider */}
                      <MStripeDivider className="absolute right-0 bottom-0 left-0" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col space-y-6 p-6">
                      <div className="flex flex-col">
                        <h4
                          className="line-clamp-2 text-[24px] leading-[1.1] font-bold text-white uppercase transition-colors"
                          title={team.name}
                        >
                          {team.name}
                        </h4>
                        <span className="mt-1.5 block text-[11px] font-bold tracking-[2px] text-[#bbbbbb] uppercase">
                          Squad Size: {teamPlayers.length}
                        </span>
                      </div>

                      {/* Owner & Captain Avatar Frames */}
                      <div className="grid grid-cols-1 gap-3 rounded-none border border-[#3c3c3c] bg-black p-3 sm:grid-cols-2">
                        {/* Owner Column */}
                        <div className="flex items-center space-x-2.5">
                          {team.ownerImageUrl ? (
                            <LazyImage
                              src={team.ownerImageUrl}
                              alt={team.ownerName}
                              fallbackText={team.ownerName}
                              className="h-7 w-7 shrink-0 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[10px] text-[#bbbbbb]">
                              👤
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="mb-0.5 block text-[8px] leading-none font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Owner
                            </span>
                            <span className="block truncate text-[10px] leading-tight font-bold text-white">
                              {team.ownerName}
                            </span>
                          </div>
                        </div>

                        {/* Captain Column */}
                        <div className="flex items-center space-x-2.5 border-l border-[#3c3c3c] pl-3">
                          {team.captainPlayer?.imageUrl ? (
                            <LazyImage
                              src={team.captainPlayer?.imageUrl}
                              alt={team.captainPlayer?.name}
                              fallbackText={team.captainPlayer?.name}
                              className="h-7 w-7 shrink-0 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[10px] text-[#bbbbbb]">
                              👤
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="mb-0.5 block text-[8px] leading-none font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Captain
                            </span>
                            <span className="block truncate text-[10px] leading-tight font-bold text-white">
                              {team.captainPlayer?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Budget progress bar spent vs left */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#bbbbbb]">Spent Budget</span>
                          <span className="font-black text-white">
                            {spentBudget} /{" "}
                            <span className="text-[#bbbbbb]">{team.totalBudget} pts</span>
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-none border border-[#3c3c3c] bg-black">
                          <div
                            className="h-full rounded-none bg-white transition-all duration-500"
                            style={{ width: `${percentSpent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-[#bbbbbb] uppercase">
                          <span>{percentSpent}% Spent</span>
                          <span className="font-black text-white">
                            {team.remainingBudget} pts left
                          </span>
                        </div>
                      </div>

                      {/* Bought Players list mini-grid */}
                      <div className="space-y-2.5 border-t border-[#3c3c3c] pt-4">
                        <span className="block text-[9px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                          Roster Log
                        </span>
                        <div className="max-h-35 space-y-1.5 overflow-y-auto pr-1">
                          {teamPlayers.map((player: any) => {
                            const isCaptain = team.captainPlayer?.id === player.id;

                            return (
                              <div
                                key={player.id}
                                className={`flex items-center justify-between rounded-none border ${
                                  isCaptain
                                    ? "border-white bg-[#1a1a1a]"
                                    : "border-[#3c3c3c] bg-black"
                                } p-2 text-xs transition-colors`}
                              >
                                <div className="flex items-center space-x-2 truncate pr-2">
                                  <span
                                    className={`truncate font-bold ${
                                      isCaptain ? "text-white" : "text-[#bbbbbb]"
                                    }`}
                                  >
                                    {player.name}
                                  </span>
                                  {isCaptain && (
                                    <span className="flex items-center space-x-0.5 rounded-none bg-white px-1 py-0.5 text-[8px] font-black tracking-wider text-black uppercase">
                                      <StarIcon className="h-2.5 w-2.5 fill-black" />
                                      <span>C</span>
                                    </span>
                                  )}
                                </div>
                                <span className="shrink-0 text-[10px] font-black text-white">
                                  {player.soldPoints} pts
                                </span>
                              </div>
                            );
                          })}
                          {teamPlayers.length === 0 && (
                            <span className="block py-2 text-[10px] text-[#bbbbbb] italic">
                              Roster is empty.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!auction.teams || auction.teams.length === 0) && (
                <p className="col-span-3 py-6 text-center text-sm text-[#bbbbbb]">
                  No teams registered yet.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </PublicAuctionGuard>
  );
}
