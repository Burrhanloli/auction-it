import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  TrophyIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  AwardIcon,
  ActivityIcon,
  DollarSignIcon,
  Loader2Icon,
} from "lucide-react";
import { motion } from "motion/react";

import { useAuctionSubscription } from "#/hooks/use-auction-subscription";
import { $getAuction } from "#/lib/auction-actions";

export const Route = createFileRoute("/auction/$auctionId/leaderboard")({
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black font-sans text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#3c3c3c] bg-black px-6 py-4">
        <div className="flex items-center space-x-4">
          <Link to="/auction/$auctionId/live" params={{ auctionId }}>
            <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] hover:bg-white hover:text-black">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
              <TrophyIcon className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-wide text-white">{auction.name}</h1>
              <span className="flex items-center text-[9px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                <ActivityIcon className="mr-1 h-3 w-3 animate-pulse text-white" />
                Live Arena Standings & Leaderboards
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

      {/* Main Container */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 space-y-12 px-6 py-10">
        {/* SECTION 1: HIGHEST VALUED PLAYERS (TOP RANKINGS) */}
        <div>
          <div className="mb-6 flex flex-col">
            <h2 className="flex items-center text-xl font-black tracking-[1.5px] text-white uppercase">
              <AwardIcon className="mr-2 h-5 w-5 text-white" />
              Highest Valued Players
            </h2>
            <p className="mt-1 text-xs text-[#bbbbbb]">
              Top tier player purchases ranked by total points spent
            </p>
          </div>

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
                    const buyerTeam = auction.teams?.find((t: any) => t.id === player.soldToTeamId);
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
                              <img
                                src={player.imageUrl}
                                alt={player.name}
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
                              <img
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
          <div className="mb-6 flex flex-col">
            <h2 className="flex items-center text-xl font-black tracking-[1.5px] text-white uppercase">
              <DollarSignIcon className="mr-2 h-5 w-5 text-white" />
              Team Roster Standings
            </h2>
            <p className="mt-1 text-xs text-[#bbbbbb]">
              Roster balance, point distributions, and purchases per registered team
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {auction.teams?.map((team: any) => {
              const teamPlayers = (auction.players ?? []).filter(
                (p: any) => p.soldToTeamId === team.id,
              );
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
                  <div className="space-y-6 p-6">
                    {/* Team Header */}
                    <div className="flex items-center space-x-3.5">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="h-11 w-11 rounded-none border border-[#3c3c3c] bg-black object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-sm font-black text-white uppercase">
                          {team.name.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <h3 className="text-md leading-tight font-bold text-white transition-colors group-hover:text-white">
                          {team.name}
                        </h3>
                        <span className="text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                          Players: {teamPlayers.length}
                        </span>
                      </div>
                    </div>

                    {/* Owner & Captain Avatar Frames */}
                    <div className="grid grid-cols-2 gap-3 rounded-none border border-[#3c3c3c] bg-black p-3">
                      {/* Owner Column */}
                      <div className="flex items-center space-x-2.5">
                        {team.ownerImageUrl ? (
                          <img
                            src={team.ownerImageUrl}
                            alt={team.ownerName}
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
                        {team.captainImageUrl ? (
                          <img
                            src={team.captainImageUrl}
                            alt={team.captainName}
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
                            {team.captainName}
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
                        {teamPlayers.map((player: any) => (
                          <div
                            key={player.id}
                            className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-2 text-xs"
                          >
                            <span className="truncate pr-2 font-bold text-[#bbbbbb]">
                              {player.name}
                            </span>
                            <span className="shrink-0 text-[10px] font-black text-white">
                              {player.soldPoints} pts
                            </span>
                          </div>
                        ))}
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
  );
}
