import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  TrophyIcon,
  PlayIcon,
  ShieldAlertIcon,
  PlusIcon,
  UserIcon,
  CompassIcon,
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  ActivityIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { $getAllAuctions, $createAuction } from "#/lib/auction-actions";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { scrollDirection } = useScrollDirection();

  // Queries
  const { data: user } = useQuery(authQueryOptions());
  const { data: auctionsData, isLoading } = useQuery({
    queryKey: ["auctions", "active", "index"],
    queryFn: () => $getAllAuctions({ data: { status: "active", limit: 11 } }),
  });

  const auctions = auctionsData?.slice(0, 10);
  const hasMoreAuctions = (auctionsData?.length || 0) > 10;

  // State for creating a new auction
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      budgetPerTeam: 1000,
      categories: [
        { name: "Elite", basePoints: 500 },
        { name: "Pro", basePoints: 300 },
        { name: "Batsmen", basePoints: 200 },
      ] as Array<{ name: string; basePoints: number }>,
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Auction name is required!");
        return;
      }
      createAuctionMutation.mutate({
        name: value.name.trim(),
        budgetPerTeam: value.budgetPerTeam,
        logoUrl: null,
        categories: value.categories,
      });
    },
  });

  // Mutation to create auction
  const createAuctionMutation = useMutation({
    mutationFn: (vars: {
      name: string;
      budgetPerTeam: number;
      logoUrl: string | null;
      categories: Array<{ name: string; basePoints: number }>;
    }) => $createAuction({ data: vars }),
    onSuccess: (res: any) => {
      toast.success("Auction created successfully!");
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      setShowCreateForm(false);
      form.reset();
      // Navigate straight to the setup of the created auction
      navigate({ to: `/admin/${res.auctionId}/setup` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create auction");
    },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      {/* Top Header Navbar */}
      <header
        className={`relative sticky top-0 z-50 border-b border-[#3c3c3c] bg-black px-4 py-4 transition-transform duration-300 ease-in-out md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
              <TrophyIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
              <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Live Broadcast Center
              </span>
            </div>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1.5">
                  <UserIcon className="h-4 w-4 text-white" />
                  <span className="text-sm font-medium text-[#bbbbbb]">{user.name}</span>
                </div>
                <Link to="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-none tracking-[1.5px] text-[#bbbbbb] uppercase hover:text-white"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    size="sm"
                    className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] font-bold tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    Register Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex items-center justify-center p-2 text-white"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black">
          <div className="h-1 w-full bg-gradient-to-r from-[#0066b1] via-[#1c69d4] to-[#e22718]" />
          <div className="flex items-center justify-between border-b border-[#3c3c3c] p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col p-6">
            {user ? (
              <div className="flex flex-col space-y-6">
                <div className="flex items-center space-x-3 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4">
                  <UserIcon className="h-5 w-5 text-white" />
                  <span className="text-base font-medium text-white">{user.name}</span>
                </div>
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-none border border-[#3c3c3c] bg-[#1a1a1a] py-6 tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-6">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full rounded-none border border-white bg-transparent py-6 tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full rounded-none border border-transparent bg-white py-6 font-bold tracking-[1.5px] text-black uppercase hover:border-white hover:bg-black hover:text-white">
                    Register Admin
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hero Presentation Banner */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-12 text-center md:px-8 md:pt-20 md:pb-16">
        <div className="mb-6 inline-flex items-center space-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1">
          <ActivityIcon className="h-4 w-4 text-white" />
          <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
            Real-Time State Synchronization Enabled
          </span>
        </div>
        <div className="mx-auto mb-8 inline-flex max-w-7xl flex-col">
          <MStripeDivider className="mb-4 w-full" />
          <h1 className="text-4xl leading-tight font-black tracking-tight text-white uppercase md:text-6xl">
            The Ultimate Premium <span className="text-white">Player Auction</span> Broadcast Hub
          </h1>
        </div>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-[#bbbbbb]">
          Create, coordinate, and broadcast high-stakes player auctions with zero manual refreshes.
          Full support for Admins, Team Owners, and dynamic Public Viewers.
        </p>

        {/* Action Panel: Viewers vs Owners vs Admins */}
        <div className="mx-auto mt-8 grid max-w-7xl grid-cols-1 gap-8 text-left md:grid-cols-3">
          {/* Card 1: Public Spectator Deck */}
          <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
                <CompassIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Live Viewer Arena</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
                Watch active player bidding wars, scrolling logs ticker, and team stats dynamically
                without page refreshes.
              </p>
            </div>
            <a
              href="#active-auctions"
              className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
            >
              Browse Live Arenas{" "}
              <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Card 2: Strategy Deck for Owners */}
          <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
                <DollarSignIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Team Strategy Deck</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
                Check remaining budgets, lock in player wishlists, and manage strategy with your
                team's 6-digit passcode.
              </p>
            </div>
            <a
              href="#active-auctions"
              className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
            >
              Access Strategy Deck{" "}
              <ChevronRightIcon className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Card 3: Administrative Control Hub */}
          <div className="group relative flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 transition-all duration-300 hover:border-white">
            <div>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
                <PlusIcon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">Create & Manage</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#bbbbbb]">
                Register team owners, set budgets, configure category pools, draw random players,
                and control real-time bids.
              </p>
            </div>
            {user ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex cursor-pointer items-center text-left text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:underline"
              >
                Create New Auction <ChevronRightIcon className="ml-1 h-4 w-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase transition-colors hover:text-white"
              >
                Sign In to Setup <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Create New Auction Overlay Dialog */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-2xl font-bold text-white">
                <PlusIcon className="mr-2 h-6 w-6 text-white" />
                Initialize Player Auction
              </h2>
              <Button
                variant="ghost"
                onClick={() => setShowCreateForm(false)}
                className="text-slate-400 hover:text-white"
              >
                Cancel
              </Button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
              className="space-y-6"
            >
              <form.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-slate-300">
                      Auction Title
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Premier League Cricket 2026"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="budgetPerTeam"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-slate-300">
                      Starting Budget Points per Team
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="1000"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="rounded-none border-[#3c3c3c] bg-black text-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="categories"
                mode="array"
                children={(field) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-slate-300">
                        Categories & Custom Base Points
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.pushValue({ name: "", basePoints: 100 })}
                        className="rounded-none border-[#3c3c3c] bg-black text-xs tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                      >
                        + Add Category
                      </Button>
                    </div>

                    <div className="max-h-50 space-y-3 overflow-y-auto pr-1">
                      {field.state.value.map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 rounded-none border border-[#3c3c3c] bg-black p-2.5"
                        >
                          <div className="flex-1">
                            <form.Field
                              name={`categories[${idx}].name`}
                              children={(subField) => (
                                <Input
                                  placeholder="Category Name (e.g. Elite, Bowler)"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          <div className="w-32">
                            <form.Field
                              name={`categories[${idx}].basePoints`}
                              children={(subField) => (
                                <Input
                                  type="number"
                                  placeholder="Base points"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(Number(e.target.value))}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              onClick={() => field.removeValue(idx)}
                              className="cursor-pointer px-2 text-sm text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={createAuctionMutation.isPending}
                  className="w-full rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
                >
                  {createAuctionMutation.isPending ? "Creating Event..." : "Launch Bidding Arena"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Sections: Auction Directory Grid */}
      <main
        id="active-auctions"
        className="relative z-10 mx-auto max-w-7xl border-t border-[#3c3c3c] px-4 py-16 md:px-8 md:py-20"
      >
        <div className="mb-10 flex flex-col justify-between md:flex-row md:items-center">
          <div>
            <div className="inline-flex flex-col">
              <MStripeDivider className="mb-2 w-full" />
              <h2 className="flex items-center text-2xl font-black text-white uppercase">
                <PlayIcon className="mr-2 h-5 w-5 text-white" />
                Active Auction Events
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Select an active event from our live dashboard database below
            </p>
          </div>

          {user && (
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black md:mt-0"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Setup New Arena
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent align-[-0.125em]" />
            <p className="mt-4 text-[#bbbbbb]">Loading live database events...</p>
          </div>
        ) : !auctions || auctions.length === 0 ? (
          <div className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-16 text-center">
            <ShieldAlertIcon className="mx-auto mb-4 h-12 w-12 text-white" />
            <h3 className="mb-2 text-lg font-bold text-white uppercase">
              No Active Arenas Registered
            </h3>
            <p className="mx-auto mb-6 max-w-md text-sm text-[#bbbbbb]">
              Create your very first Player Auction event to start inviting team owners and public
              audiences.
            </p>
            {user ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
              >
                Launch First Arena
              </Button>
            ) : (
              <Link to="/signup">
                <Button className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
                  Register as Admin
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {auctions.map((auc) => (
                <div
                  key={auc.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white"
                >
                  <div className="p-8">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="inline-flex items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black px-2 py-0.5 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
                        <span>{auc.status}</span>
                      </div>
                      <span className="flex items-center text-[10px] text-[#bbbbbb]">
                        <CalendarIcon className="mr-1 h-3.5 w-3.5" />
                        {new Date(auc.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="mb-2 text-xl font-bold text-white uppercase">{auc.name}</h3>

                    <div className="mt-4 flex items-center space-x-4 rounded-none border border-[#3c3c3c] bg-black p-2.5 text-xs text-[#bbbbbb]">
                      <div>
                        <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                          Point Budget
                        </span>
                        <span className="font-bold text-white">{auc.budgetPerTeam} pts</span>
                      </div>
                      <div className="h-6 border-l border-[#3c3c3c]" />
                      <div>
                        <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                          Unique Key
                        </span>
                        <span className="block max-w-[120px] truncate font-mono text-[9px] text-[#bbbbbb]">
                          {auc.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 border-t border-[#3c3c3c] bg-[#1a1a1a] px-8 py-5 sm:grid-cols-3">
                    {auc.status !== "draft" ? (
                      <>
                        <Link
                          to="/auction/$auctionId/live"
                          params={{ auctionId: auc.slug! }}
                          className="flex items-center justify-center space-x-1 rounded-none border border-[#3c3c3c] bg-black py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                        >
                          <span>Arena</span>
                        </Link>

                        <Link
                          to="/auction/$auctionId/leaderboard"
                          params={{ auctionId: auc.slug! }}
                          className="flex items-center justify-center space-x-1 rounded-none border border-[#3c3c3c] bg-black py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                        >
                          <span>Stats</span>
                        </Link>
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center justify-center rounded-none border border-[#3c3c3c] bg-black py-2 text-center text-xs font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                        <span>Draft Mode (Locked)</span>
                      </div>
                    )}

                    <Link
                      to="/team/$auctionId"
                      params={{ auctionId: auc.slug! }}
                      className="flex items-center justify-center space-x-1 rounded-none border border-[#3c3c3c] bg-black py-2 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                    >
                      <span>Strategy</span>
                    </Link>

                    {user && auc.userId === user.id && (
                      <Link
                        to="/admin/$auctionId/control"
                        params={{ auctionId: auc.slug! }}
                        className="col-span-3 mt-2 flex items-center justify-center rounded-none border border-[#3c3c3c] bg-black py-1.5 text-center text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase transition-all hover:bg-white hover:text-black"
                      >
                        <span>Go To Panel 🔧</span>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasMoreAuctions && (
              <div className="mt-12 flex justify-center">
                <Link to="/auctions">
                  <Button className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-8 py-6 font-bold tracking-[1.5px] text-white uppercase transition-colors hover:border-white hover:bg-white hover:text-black">
                    View All Active Arenas
                  </Button>
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
