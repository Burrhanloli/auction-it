import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/input-otp";
import { Label } from "@repo/ui/components/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheckIcon,
  CoinsIcon,
  StarIcon,
  SearchIcon,
  TrophyIcon,
  ArrowLeftIcon,
  LockIcon,
  LogOutIcon,
  Loader2Icon,
  TvIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { ImageViewer } from "#/components/image-viewer";
import { useAuctionSubscription } from "#/hooks/use-auction-subscription";
import { useTeamSession } from "#/hooks/use-team-session";
import {
  $getAuction,
  $verifyTeamPasscode,
  $getTeamStrategyDeck,
  $toggleWishlist,
  $selectCaptain,
} from "#/lib/auction-actions";

const teamSearchSchema = z.object({
  teamId: z.string().optional(),
});

import { useScrollDirection } from "#/hooks/use-scroll-direction";

export const Route = createFileRoute("/team/$auctionId")({
  validateSearch: teamSearchSchema,
  component: TeamStrategyDeckPage,
});

function TeamStrategyDeckPage() {
  const { auctionId } = Route.useParams();
  const { teamId } = Route.useSearch();
  const queryClient = useQueryClient();
  const { scrollDirection } = useScrollDirection();

  // Queries
  const { data: auction, isLoading: isAuctionLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  // Session state: stores verified teamId via hook
  const { verifiedTeamId, setVerifiedTeamId, sessionLoading } = useTeamSession(auctionId, teamId);

  // Lockscreen form states
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [passcode, setPasscode] = useState("");

  const activeSelectedTeamId = selectedTeamId || teamId || auction?.teams?.[0]?.id || "";

  // Search & wishlist category filter tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Query strategy deck data once passcode is verified
  const { data: deckData, isLoading: isDeckLoading } = useQuery({
    queryKey: ["strategy-deck", auctionId, verifiedTeamId],
    queryFn: () => $getTeamStrategyDeck({ data: { auctionId, teamId: verifiedTeamId! } }),
    enabled: !!verifiedTeamId,
  });

  // Subscribe to SSE stream to fetch real-time updates (budget changes, sales, wishlist updates)
  useAuctionSubscription(
    auctionId,
    verifiedTeamId ? [["strategy-deck", auctionId, verifiedTeamId]] : [],
  );

  // Mutations
  const verifyPasscodeMutation = useMutation({
    mutationFn: (vars: { auctionId: string; teamId: string; passcode: string }) =>
      $verifyTeamPasscode({ data: vars }),
    onSuccess: (res: any) => {
      if (res.success && res.teamId) {
        toast.success(`Access Granted: Welcome "${res.teamName}"!`);
        localStorage.setItem(`auction-session-${auctionId}`, res.teamId);
        setVerifiedTeamId(res.teamId);
        setPasscode("");
      } else {
        toast.error(res.error || "Incorrect Passcode");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Verification failed");
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: (vars: { teamId: string; playerId: string; active: boolean }) =>
      $toggleWishlist({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["strategy-deck", auctionId, verifiedTeamId],
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update wishlist");
    },
  });

  const selectCaptainMutation = useMutation({
    mutationFn: (vars: { teamId: string; playerId: string }) => $selectCaptain({ data: vars }),
    onSuccess: () => {
      toast.success("Captain selected successfully!");
      queryClient.invalidateQueries({
        queryKey: ["strategy-deck", auctionId, verifiedTeamId],
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to select captain");
    },
  });

  const handleLoginSubmit = (e: any) => {
    e.preventDefault();

    const currentTeamId = activeSelectedTeamId;
    if (!currentTeamId) {
      toast.error("Please select your Franchise Team");
      return;
    }
    if (passcode.length !== 6) {
      toast.error("Enter the 6-digit access passcode");
      return;
    }

    verifyPasscodeMutation.mutate({
      auctionId,
      teamId: currentTeamId,
      passcode,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem(`auction-session-${auctionId}`);
    setVerifiedTeamId(null);
    toast.success("Disconnected strategy deck session.");
  };

  const handleToggleWishlist = (playerId: string, isWishlisted: boolean) => {
    if (!verifiedTeamId) return;

    toggleWishlistMutation.mutate({
      teamId: verifiedTeamId,
      playerId,
      active: !isWishlisted,
    });
  };

  const handleSelectCaptain = (playerId: string) => {
    if (!verifiedTeamId) return;
    if (
      confirm(
        "Are you sure you want to select this player as your captain? This will make them ineligible for the auction.",
      )
    ) {
      selectCaptainMutation.mutate({
        teamId: verifiedTeamId,
        playerId,
      });
    }
  };

  if (isAuctionLoading || sessionLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-10 w-10 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Syncing Strategy Channel...
        </span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 h-12 w-12 text-white" />
        <h2 className="mb-2 text-xl font-bold text-white">Arena Not Found</h2>
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

  // --- RENDERING SECURITY GATE ---
  if (!verifiedTeamId) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black p-6 text-white">
        <div className="relative w-full max-w-md rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          {/* Logo / Header */}
          <div className="mb-8 flex flex-col items-center space-y-4 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
              <LockIcon className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-[1.5px] text-white uppercase">
                Strategy Deck Gate
              </h2>
              <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#bbbbbb]">
                Authenticate with your team credential keys to access private wishlists and bid
                panels.
              </p>
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div className="space-y-3">
              <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Select Franchise Team
              </Label>
              {auction.teams && auction.teams.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {auction.teams.map((t: any) => {
                    const isSelected = activeSelectedTeamId === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTeamId(t.id)}
                        className={`relative flex w-full flex-col items-start rounded-none border p-3.5 text-left transition-all duration-200 select-none ${
                          isSelected
                            ? "border-white bg-black ring-1 ring-white"
                            : "border-[#3c3c3c] bg-black hover:border-[#bbbbbb] hover:bg-[#1a1a1a]"
                        }`}
                      >
                        {/* Top right status badge */}
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-none bg-white text-[10px] font-black text-black">
                            ✓
                          </div>
                        )}

                        <div className="flex w-full items-center space-x-2.5">
                          {t.logoUrl ? (
                            <img
                              src={t.logoUrl}
                              alt={t.name}
                              className="h-8 w-8 rounded-none border border-[#3c3c3c] bg-black object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[10px] font-black text-[#bbbbbb] uppercase">
                              {t.name.slice(0, 2)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h5 className="truncate text-xs leading-tight font-black text-white">
                              {t.name}
                            </h5>
                            <span className="mt-0.5 block truncate text-[10px] font-bold text-[#bbbbbb]">
                              Owner: {t.ownerName}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-none border border-[#3c3c3c] bg-black py-4 text-center text-xs text-[#bbbbbb]">
                  No franchise teams registered for this auction.
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="passcodeInput" className="text-xs font-bold text-[#bbbbbb]">
                6-Digit Passcode
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={passcode}
                  onChange={(val) => setPasscode(val)}
                  className="gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot
                      index={0}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                    <InputOTPSlot
                      index={1}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                    <InputOTPSlot
                      index={2}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                    <InputOTPSlot
                      index={3}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                    <InputOTPSlot
                      index={4}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                    <InputOTPSlot
                      index={5}
                      className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-black font-mono text-xl font-bold text-white"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
            </div>

            <Button
              type="submit"
              disabled={verifyPasscodeMutation.isPending || !activeSelectedTeamId}
              className="w-full cursor-pointer rounded-none border border-white bg-white py-3.5 font-black tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#bbbbbb]"
            >
              {verifyPasscodeMutation.isPending ? "Unlocking Deck..." : "Access Strategy Deck 🔓"}
            </Button>
          </form>

          <div className="mt-6 border-t border-[#3c3c3c] pt-4 text-center">
            <Link to="/">
              <span className="flex cursor-pointer items-center justify-center space-x-1 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:text-white">
                <ArrowLeftIcon className="h-3 w-3" />
                <span>Return to Lobby</span>
              </span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING STRATEGY DECK BOARD ---
  if (isDeckLoading || !deckData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-8 w-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Unlocking security vault...
        </span>
      </div>
    );
  }

  const { team, wishlistPlayerIds, allPlayers } = deckData;

  // Filter lists
  const soldToThisTeam = team.players ?? [];
  const spentPoints = soldToThisTeam.reduce((acc: number, p: any) => acc + (p.soldPoints ?? 0), 0);

  const filteredUnsoldPlayers = allPlayers.filter((player: any) => {
    const isUnsold = player.status === "unsold";
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.skills.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategoryTab === "all" || player.categoryId === selectedCategoryTab;

    return isUnsold && matchesSearch && matchesCategory;
  });

  const wishlistPlayers = allPlayers.filter((p: any) => wishlistPlayerIds.includes(p.id));

  // Determine budget status bar metrics
  const budgetRatio = team.remainingBudget / team.totalBudget;
  const isBudgetLow = team.remainingBudget < 150;
  const budgetGlowColor =
    budgetRatio > 0.5
      ? "bg-white"
      : budgetRatio > 0.2
        ? "bg-[#bbbbbb]"
        : "bg-red-500 animate-pulse";

  return (
    <div className="flex min-h-screen flex-col bg-black pb-12 font-sans text-white">
      {/* Header bar */}
      <header
        className={`sticky top-0 z-50 flex flex-col justify-between gap-4 border-b border-[#3c3c3c] bg-black px-4 py-4 transition-transform duration-300 ease-in-out md:flex-row md:items-center md:gap-0 md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-sm font-bold tracking-wide text-white">{team.name}</h1>
                <span className="rounded-none border border-[#3c3c3c] bg-black px-2 py-0.5 text-[8px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                  Strategy Deck
                </span>
              </div>
              <span className="mt-2 flex items-center text-[10px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                <div className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-none border border-white bg-white p-1">
                  {auction.logoUrl ? (
                    <ImageViewer
                      src={auction.logoUrl}
                      alt="Logo"
                      className="h-full w-full object-cover"
                      triggerClassName="w-full h-full block"
                    />
                  ) : (
                    <TrophyIcon className="h-5 w-5 text-black" />
                  )}
                </div>
                <span>AUCTION-IT : {auction.name}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="group flex items-center space-x-3">
          <Link to="/auction/$auctionId/live" params={{ auctionId }}>
            <button className="flex flex-1 cursor-pointer items-center justify-center space-x-1.5 rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white md:flex-none">
              <TvIcon className="h-4 w-4" />
              <span>Public Live Arena</span>
            </button>
          </Link>
          <button
            onClick={handleLogout}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2 text-[#bbbbbb] hover:bg-white hover:text-black"
            title="Lock Deck Session"
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Background Watermark for Team Strategy */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-5">
        {team.logoUrl ? (
          <img
            src={team.logoUrl}
            alt="Watermark"
            className="max-h-[80vh] max-w-[80vw] object-contain blur-[2px]"
          />
        ) : null}
      </div>

      {/* Main Grid */}
      <div className="relative z-10 mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:mt-10 md:gap-10 md:px-8 lg:grid-cols-3">
        {/* Left Column: Budget details & Captain/Owner details (1/3 width) */}
        <div className="space-y-8 lg:col-span-1">
          {/* Team Branding */}
          <div className="relative flex flex-col items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 text-center">
            {team.logoUrl ? (
              <ImageViewer
                src={team.logoUrl}
                alt={team.name}
                className="mb-4 h-32 w-32 rounded-none border border-[#3c3c3c] bg-black object-cover"
              />
            ) : (
              <div className="mb-4 flex h-32 w-32 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-4xl font-black text-[#bbbbbb] uppercase">
                {team.name.slice(0, 2)}
              </div>
            )}
            <h2 className="text-xl font-black tracking-[1.5px] text-white uppercase">
              {team.name}
            </h2>
            <p className="mt-1 text-[10px] font-bold text-[#bbbbbb] uppercase">
              Official Strategy Deck
            </p>
          </div>

          {/* Budget Meter */}
          <div className="relative rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <h3 className="mb-6 flex items-center text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
              <CoinsIcon className="mr-2 h-4 w-4 text-white" />
              Capital Budget Deck
            </h3>

            <div className="space-y-6">
              {/* Spent vs Remaining numbers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-none border border-[#3c3c3c] bg-black p-4">
                  <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                    Total Spent
                  </span>
                  <span className="mt-1 block text-xl font-black text-white">
                    {spentPoints} pts
                  </span>
                </div>
                <div className="rounded-none border border-[#3c3c3c] bg-black p-4">
                  <span className="block text-[8px] font-black tracking-[1.5px] text-white uppercase">
                    Remaining
                  </span>
                  <span className="mt-1 block text-xl font-black text-white">
                    {team.remainingBudget} pts
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#bbbbbb]">
                  <span>BUDGET EXHAUSTION METER</span>
                  <span>{Math.round(budgetRatio * 100)}% Available</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-none border border-[#3c3c3c] bg-black">
                  <div
                    className={`h-full rounded-none transition-all duration-500 ${budgetGlowColor}`}
                    style={{ width: `${budgetRatio * 100}%` }}
                  />
                </div>
              </div>

              {isBudgetLow && (
                <div className="flex items-start space-x-2 rounded-none border border-red-500 bg-black p-3 text-[10px] leading-relaxed font-semibold text-white">
                  <span className="self-center text-xs">⚠️</span>
                  <span>
                    BUDGET CRITICAL! Residual capital drops below 150 points. Pace your upcoming
                    roster acquisitions strategically.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Franchise Personnel */}
          <div className="relative rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <h3 className="mb-6 text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
              Franchise Executives
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-3.5">
                <div className="flex items-center space-x-3">
                  {team.ownerImageUrl ? (
                    <ImageViewer
                      src={team.ownerImageUrl}
                      alt={team.ownerName}
                      className="h-10 w-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] font-bold text-[#bbbbbb]">
                      💼
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-bold text-white">{team.ownerName}</span>
                    <span className="mt-0.5 block text-[9px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      Franchise Owner
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-3.5">
                <div className="flex items-center space-x-3">
                  {team.captainPlayer?.imageUrl ? (
                    <img
                      src={team.captainPlayer?.imageUrl}
                      alt={team.captainPlayer?.name}
                      className="h-10 w-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] font-bold text-[#bbbbbb]">
                      👤
                    </div>
                  )}
                  <div>
                    <span className="block text-xs font-bold text-white">
                      {team.captainPlayer?.name}
                    </span>
                    <span className="mt-0.5 block text-[9px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      Team Captain
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center/Right Column: Interactive player checklist & private wishlists (2/3 width) */}
        <div className="space-y-8 lg:col-span-2">
          {/* Roster list acquired */}
          <div className="flex-1 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-5 flex items-center justify-between border-b border-[#3c3c3c] pb-3">
              <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                Acquired Squad ({soldToThisTeam.length})
              </h3>
              <span className="text-[10px] text-[#bbbbbb]">Active roster</span>
            </div>

            <div className="max-h-[30vh] space-y-3 overflow-y-auto pr-1">
              {soldToThisTeam.map((player: any) => {
                const categoryColor = "border-[#3c3c3c] text-[#bbbbbb] bg-black";

                return (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-black p-3"
                  >
                    <div className="flex items-center space-x-3">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="h-8 w-8 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[9px] font-bold text-[#bbbbbb]">
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

                    <div className="text-right">
                      <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        {player.status === "captain" ? "Role" : "Acquired at"}
                      </span>
                      <span className="text-xs font-black text-white">
                        {player.status === "captain" ? "TEAM CAPTAIN" : `${player.soldPoints} pts`}
                      </span>
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

          {/* Dynamic Wishlist Deck */}
          <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-5 flex items-center justify-between border-b border-[#3c3c3c] pb-4">
              <div>
                <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                  Starred Wishlist Players
                </h3>
                <p className="mt-1 text-[10px] text-[#bbbbbb]">
                  Sought-after candidate pool currently unsold
                </p>
              </div>
              <span className="rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-bold text-[#bbbbbb]">
                {wishlistPlayers.length} Watchlist Entries
              </span>
            </div>

            <div className="grid max-h-[30vh] grid-cols-1 gap-4 overflow-y-auto pr-1 md:grid-cols-2">
              {wishlistPlayers.map((player: any) => {
                const isSoldToOthers =
                  (player.status === "sold" || player.status === "captain") &&
                  player.soldToTeamId !== verifiedTeamId;
                const isSoldToMe =
                  (player.status === "sold" || player.status === "captain") &&
                  player.soldToTeamId === verifiedTeamId;

                return (
                  <div
                    key={player.id}
                    className={`relative flex items-center justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-black p-3 transition-all duration-200 hover:border-white ${
                      isSoldToMe ? "opacity-50" : isSoldToOthers ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {player.imageUrl ? (
                        <div className="relative shrink-0">
                          <img
                            src={player.imageUrl}
                            alt={player.name}
                            className={`h-9 w-9 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover transition-all ${
                              player.status === "sold" || player.status === "captain"
                                ? "brightness-50 contrast-125 grayscale"
                                : ""
                            }`}
                          />
                          {(player.status === "sold" || player.status === "captain") && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center rounded-none bg-black/50 backdrop-blur-[0.5px]`}
                            >
                              <span
                                className={`py-0.2 rotate-[-15deg] rounded-none border border-[#3c3c3c] bg-black px-0.5 text-[6px] font-black tracking-[1.5px] text-white uppercase`}
                              >
                                {isSoldToMe
                                  ? player.status === "captain"
                                    ? "CAPTAIN"
                                    : "MINE"
                                  : player.status === "captain"
                                    ? "CAPTAIN"
                                    : "SOLD"}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[10px] font-bold text-[#bbbbbb] uppercase transition-all ${
                              player.status === "sold" || player.status === "captain"
                                ? "border-[#3c3c3c] bg-black text-[#bbbbbb]"
                                : ""
                            }`}
                          >
                            {player.name.slice(0, 2)}
                          </div>
                          {(player.status === "sold" || player.status === "captain") && (
                            <div
                              className={`absolute inset-0 flex items-center justify-center rounded-none bg-black/50`}
                            >
                              <span
                                className={`py-0.2 rotate-[-15deg] rounded-none border border-[#3c3c3c] bg-black px-0.5 text-[6px] font-black tracking-[1.5px] text-white uppercase`}
                              >
                                {isSoldToMe
                                  ? player.status === "captain"
                                    ? "CAPTAIN"
                                    : "MINE"
                                  : player.status === "captain"
                                    ? "CAPTAIN"
                                    : "SOLD"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-xs font-black text-white">{player.name}</h4>
                          <StarIcon className="h-3 w-3 fill-white text-white" />
                        </div>
                        <span className="block text-[9px] text-[#bbbbbb]">
                          Category: {player.category?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-right">
                      <div>
                        {isSoldToOthers ? (
                          <div className="space-y-0.5">
                            <span className="block rounded-none border border-white bg-white px-1.5 py-0.5 text-[8px] font-black tracking-[1.5px] text-black uppercase">
                              {player.status === "captain" ? "CAPTAIN" : "SOLD OUT"}
                            </span>
                            <span className="block text-[8px] text-[#bbbbbb]">
                              to {player.soldToTeam?.name}
                            </span>
                          </div>
                        ) : isSoldToMe ? (
                          <span className="block rounded-none border border-white bg-white px-1.5 py-0.5 text-[8px] font-black tracking-[1.5px] text-black uppercase">
                            {player.status === "captain" ? "CAPTAIN" : "ACQUIRED"}
                          </span>
                        ) : (
                          <div className="space-y-0.5">
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Base price
                            </span>
                            <span className="text-[11px] font-black text-white">
                              {player.category?.basePoints} pts
                            </span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleWishlist(player.id, true)}
                        className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-black p-2 text-white hover:bg-white hover:text-black"
                        title="Remove from Wishlist"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {wishlistPlayers.length === 0 && (
                <div className="col-span-2 py-8 text-center text-xs text-slate-600 italic">
                  Private Strategy Wishlist is currently empty. Star prospective candidates in the
                  lobby below.
                </div>
              )}
            </div>
          </div>

          {/* Registry Draft Lobby */}
          <div className="flex-1 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-5 border-b border-[#3c3c3c] pb-4">
              <h3 className="text-xs font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                Registry Draft Lobby
              </h3>
              <p className="mt-1 text-[10px] text-[#bbbbbb]">
                Review active pools, explore stats, and add contenders to wishlist
              </p>
            </div>

            {/* Filters layout */}
            <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="relative md:col-span-2">
                <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                <Input
                  placeholder="Search draft contenders name/skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-none border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                />
              </div>

              <select
                value={selectedCategoryTab}
                onChange={(e) => setSelectedCategoryTab(e.target.value)}
                className="rounded-none border border-[#3c3c3c] bg-black p-2.5 text-xs text-white outline-none focus:border-white"
              >
                <option value="all">All Category Decks</option>
                {auction.categories?.map((cat: any) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} Deck
                  </option>
                ))}
              </select>
            </div>

            {/* List */}
            <div className="grid max-h-[48vh] grid-cols-1 gap-6 overflow-y-auto pr-1 md:grid-cols-2 lg:max-h-[68vh]">
              {filteredUnsoldPlayers.map((player: any) => {
                const isWishlisted = wishlistPlayerIds.includes(player.id);

                return (
                  <div
                    key={player.id}
                    className="relative flex flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-black transition-all duration-300 hover:scale-[1.02] hover:border-white"
                  >
                    {/* Top Half: Full Bleed 4:5 Image */}
                    <div className="relative aspect-[4/5] w-full shrink-0 border-b border-[#3c3c3c] bg-black">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="h-full w-full rounded-none object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center font-black text-white uppercase opacity-20">
                          <span className="text-8xl">{player.name.slice(0, 1)}</span>
                          <span className="text-5xl">
                            {player.name.split(" ")?.[1]?.slice(0, 1) || ""}
                          </span>
                        </div>
                      )}

                      {/* Action buttons overlay top-right */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button
                          onClick={() => handleToggleWishlist(player.id, isWishlisted)}
                          className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border transition-all ${
                            isWishlisted
                              ? "border-white bg-white text-black shadow-lg shadow-black/50"
                              : "border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] hover:border-white hover:bg-black hover:text-white"
                          }`}
                          title={isWishlisted ? "Remove Wishlist Star" : "Add Wishlist Star"}
                        >
                          <StarIcon className={`h-5 w-5 ${isWishlisted ? "fill-current" : ""}`} />
                        </button>
                      </div>

                      {/* Status badge bottom-left */}
                      {player.status === "bidding" && (
                        <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                          <span className="inline-flex w-fit animate-pulse items-center rounded-none border border-[#3c3c3c] bg-black px-3 py-1 text-[10px] font-black tracking-[1.5px] text-white uppercase shadow-lg shadow-black/50">
                            <span className="mr-1.5 h-2 w-2 rounded-full bg-[#0fa336]" />
                            ACTIVE BID
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Half: Content padding p-6 */}
                    <div className="flex flex-1 flex-col justify-between bg-[#1a1a1a] p-6">
                      <div>
                        {/* Category tag */}
                        <span className="mb-4 inline-block rounded-none border border-[#3c3c3c] bg-black px-2.5 py-1 text-[10px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                          {player.category?.name || "Player Pool"}
                        </span>

                        <h4
                          className="mb-2 text-2xl leading-none font-bold tracking-tight text-white uppercase"
                          title={player.name}
                        >
                          {player.name}
                        </h4>

                        <p className="mb-6 text-sm font-light text-[#bbbbbb]">
                          <span className="mb-1 block text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                            Skills
                          </span>
                          {player.skills}
                        </p>
                      </div>

                      {/* Bottom Stats Line & Actions */}
                      <div className="flex w-full items-center justify-between border-t border-[#3c3c3c] pt-4">
                        <div className="min-w-0 flex-1">
                          <span className="block text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                            Base Value
                          </span>
                          <span className="text-xl font-bold text-white uppercase">
                            {player.category?.basePoints} pts
                          </span>
                        </div>
                        <div className="text-right">
                          <button
                            onClick={() => handleSelectCaptain(player.id)}
                            className="flex cursor-pointer items-center justify-center rounded-none border border-white bg-transparent px-4 py-2 text-[10px] font-bold tracking-[1.5px] text-white uppercase transition-all hover:bg-white hover:text-black"
                            title="Select as Team Captain"
                          >
                            Make Captain
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredUnsoldPlayers.length === 0 && (
                <div className="col-span-2 flex flex-col items-center justify-center space-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-black py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-[#bbbbbb]">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Lobby Category Exhausted</h4>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                      All players in this category filter have been drafted or match search
                      criteria.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
