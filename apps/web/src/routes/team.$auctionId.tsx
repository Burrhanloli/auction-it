import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheckIcon, LogOutIcon, Loader2Icon, TvIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuctionHero } from "#/components/auction-hero";
import { Logo } from "#/components/logo";
import { AcquiredSquad } from "#/components/team/acquired-squad";
import { LeftColumn } from "#/components/team/left-column";
import { RegistryDraftLobby } from "#/components/team/registry-draft-lobby";
import { SecurityGate } from "#/components/team/security-gate";
import { WishlistDeck } from "#/components/team/wishlist-deck";
import { useAuctionSubscription } from "#/hooks/use-auction-subscription";
import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { useTeamSession } from "#/hooks/use-team-session";
import {
  $getAuction,
  $verifyTeamPasscode,
  $getTeamStrategyDeck,
  $toggleWishlist,
  $selectCaptain,
  $revertPlayer,
} from "#/lib/auction-actions";

const teamSearchSchema = z.object({
  teamId: z.string().optional(),
});

export const Route = createFileRoute("/team/$auctionId")({
  validateSearch: teamSearchSchema,
  component: TeamDashboardPage,
});

function TeamDashboardPage() {
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

  // Subscribe to SSE stream to fetch real-time updates
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
        queryClient.invalidateQueries({ queryKey: ["strategy-deck", auctionId, res.teamId] });
        toast.success(`Access Granted: Welcome "${res.teamName}"!`);
        localStorage.setItem(`auction-session-${auctionId}`, res.teamId);
        setVerifiedTeamId(res.teamId);
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

  const revertPlayerMutation = useMutation({
    mutationFn: (vars: { auctionId: string; playerId: string }) => $revertPlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Player reverted successfully!");
      queryClient.invalidateQueries({
        queryKey: ["strategy-deck", auctionId, verifiedTeamId],
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to revert player");
    },
  });

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
      window.confirm(
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 size-10 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Syncing Strategy Channel…
        </span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 size-12 text-white" />
        <h2 className="mb-2 text-xl font-bold text-white">Arena Not Found</h2>
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

  // --- RENDERING SECURITY GATE ---
  if (!verifiedTeamId) {
    return (
      <SecurityGate
        auction={auction}
        auctionId={auctionId}
        activeSelectedTeamId={activeSelectedTeamId}
        setSelectedTeamId={setSelectedTeamId}
        verifyPasscodeMutation={verifyPasscodeMutation}
      />
    );
  }

  // --- RENDERING STRATEGY DECK BOARD ---
  if (isDeckLoading || !deckData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-950 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 size-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Unlocking security vault…
        </span>
      </div>
    );
  }

  const { team, wishlistPlayerIds, allPlayers } = deckData;

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

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 pb-12 font-sans text-white">
      {/* Header bar */}
      <header
        className={`relative sticky top-0 z-40 flex flex-col justify-between gap-4 border-b border-[#3c3c3c] bg-neutral-950 px-4 py-4 transition-transform duration-300 ease-in-out md:flex-row md:items-center md:gap-0 md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-x-2">
            <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
              <Logo className="size-[18px]" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
            </div>
          </div>
        </div>

        <div className="group flex items-center gap-x-2">
          <Link to="/auction/$auctionId/live" params={{ auctionId }}>
            <button
              type="button"
              className="flex flex-1 cursor-pointer items-center justify-center gap-x-2 rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white md:flex-none"
            >
              <TvIcon className="size-4" />
              <span>Public Live Arena</span>
            </button>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2 text-[#bbbbbb] hover:bg-white hover:text-black"
            title="Lock Deck Session"
          >
            <LogOutIcon className="size-4" />
          </button>
        </div>
      </header>

      <AuctionHero auction={auction} subtitle="Strategy Deck" />

      {/* Background Watermark for Team Strategy */}
      <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center opacity-5">
        {team.logoUrl ? (
          <LazyImage
            src={team.logoUrl}
            alt="Watermark"
            priority
            className="max-h-[80vh] max-w-[80vw] object-contain blur-[2px]"
          />
        ) : null}
      </div>

      {/* Main Grid */}
      <div className="relative z-10 mx-auto mt-6 grid w-full max-w-7xl grid-cols-1 gap-6 px-4 md:mt-10 md:gap-10 md:px-8 lg:grid-cols-3">
        {/* Left Column: Budget details & Captain/Owner details (1/3 width) */}
        <LeftColumn
          team={team}
          auction={auction}
          soldToThisTeam={soldToThisTeam}
          spentPoints={spentPoints}
        />

        {/* Center/Right Column: Interactive player checklist & private wishlists (2/3 width) */}
        <div className="gap-y- lg:col-span-2">
          {/* Roster list acquired */}
          <AcquiredSquad
            soldToThisTeam={soldToThisTeam}
            auctionId={auctionId}
            revertPlayerMutation={revertPlayerMutation}
          />

          {/* Dynamic Wishlist Deck */}
          <WishlistDeck
            wishlistPlayers={wishlistPlayers}
            verifiedTeamId={verifiedTeamId}
            handleToggleWishlist={handleToggleWishlist}
          />

          {/* Registry Draft Lobby */}
          <RegistryDraftLobby
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedCategoryTab={selectedCategoryTab}
            setSelectedCategoryTab={setSelectedCategoryTab}
            auction={auction}
            filteredUnsoldPlayers={filteredUnsoldPlayers}
            wishlistPlayerIds={wishlistPlayerIds}
            handleToggleWishlist={handleToggleWishlist}
            handleSelectCaptain={handleSelectCaptain}
          />
        </div>
      </div>
    </div>
  );
}
