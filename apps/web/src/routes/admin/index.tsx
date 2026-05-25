import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import {
  TrophyIcon,
  PlusIcon,
  LogOutIcon,
  CalendarIcon,
  PlayCircleIcon,
  FileEditIcon,
  ArrowRightIcon,
  Loader2Icon,
  ActivityIcon,
  LayoutDashboardIcon,
  ChevronRightIcon,
  SparklesIcon,
  GavelIcon,
  UsersIcon,
  CoinsIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageViewer } from "#/components/image-viewer";
import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { $getAuctionsByUser, $createAuction, $updateAuctionStatus } from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/")({
  beforeLoad: async ({ context }) => {
    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (!user) {
      throw redirect({ to: "/login" });
    }
    return { user };
  },
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const { scrollDirection } = useScrollDirection();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: auctions, isLoading } = useQuery({
    queryKey: ["my-auctions"],
    queryFn: () => $getAuctionsByUser(),
  });

  const form = useForm({
    defaultValues: {
      name: "",
      logoUrl: "",
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
        logoUrl: value.logoUrl ? value.logoUrl.trim() : null,
        categories: value.categories,
      });
    },
  });

  const createAuctionMutation = useMutation({
    mutationFn: (vars: {
      name: string;
      budgetPerTeam: number;
      logoUrl: string | null;
      categories: Array<{ name: string; basePoints: number }>;
    }) => $createAuction({ data: vars }),
    onSuccess: (res: any) => {
      toast.success("Auction created successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      setShowCreateModal(false);
      form.reset();
      navigate({ to: `/admin/${res.auctionId}/setup` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create auction");
    },
  });

  const handleLogout = async () => {
    await authClient.signOut();
    queryClient.clear();
    navigate({ to: "/login" });
  };

  const draftAuctions = auctions?.filter((a) => a.status === "draft") ?? [];
  const liveAuctions = auctions?.filter((a) => a.status === "active") ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-sans text-white">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b border-[#3c3c3c] bg-black px-4 py-4 transition-transform duration-300 ease-in-out md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <div className="flex cursor-pointer items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
                  <TrophyIcon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                    AUCTION-IT
                  </span>
                  <span className="block text-[10px] font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                    Admin Dashboard
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="hidden items-center space-x-4 md:flex">
            <div className="flex items-center space-x-2 rounded-none border border-[#3c3c3c] bg-black px-4 py-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-none bg-white text-xs font-bold tracking-[1.5px] text-black uppercase">
                {user?.name?.slice(0, 1)}
              </div>
              <span className="text-sm font-medium text-white">{user?.name}</span>
            </div>
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-none tracking-[1.5px] text-[#bbbbbb] uppercase hover:text-white"
              >
                Public Site
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center space-x-2 rounded-none border border-[#3c3c3c] bg-black px-4 py-2 text-sm font-medium tracking-[1.5px] text-[#bbbbbb] uppercase transition-colors hover:bg-white hover:text-black"
            >
              <LogOutIcon className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
                <TrophyIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">Admin</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col space-y-6 p-6">
            <div className="flex items-center space-x-3 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-none bg-white text-base font-bold tracking-[1.5px] text-black uppercase">
                {user?.name?.slice(0, 1)}
              </div>
              <span className="text-base font-medium text-white">{user?.name}</span>
            </div>
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full rounded-none border border-[#3c3c3c] bg-transparent py-6 tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
              >
                Public Site
              </Button>
            </Link>
            <Button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full rounded-none border border-transparent bg-white py-6 font-bold tracking-[1.5px] text-black uppercase hover:border-white hover:bg-black hover:text-white"
            >
              <LogOutIcon className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        {/* Welcome Banner */}
        <div className="mb-12">
          <div className="mb-3 inline-flex items-center space-x-2 rounded-none border border-[#3c3c3c] bg-black px-3 py-1">
            <LayoutDashboardIcon className="h-3.5 w-3.5 text-white" />
            <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
              Admin Control Center
            </span>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white uppercase">
                Welcome back, <span className="text-white">{user?.name?.split(" ")[0]}</span>
              </h1>
              <p className="mt-2 text-[#bbbbbb]">
                Manage your auctions, configure teams and players, and run live bidding sessions.
              </p>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex shrink-0 cursor-pointer items-center space-x-2 rounded-none border border-white bg-white px-6 py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Auction</span>
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mb-10 grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Total Auctions
            </span>
            <span className="mt-2 block text-4xl font-black text-white">
              {auctions?.length ?? 0}
            </span>
          </div>
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Draft
            </span>
            <span className="mt-2 block text-4xl font-black text-white">
              {draftAuctions.length}
            </span>
          </div>
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-[1.5px] text-white uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
              Live
            </span>
            <span className="mt-2 block text-4xl font-black text-white">{liveAuctions.length}</span>
          </div>
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <span className="block text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Completed
            </span>
            <span className="mt-2 block text-4xl font-black text-white">
              {auctions?.filter((a) => a.status === "completed").length ?? 0}
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-[#bbbbbb]">
            <Loader2Icon className="mb-4 h-10 w-10 animate-spin text-white" />
            <span className="text-sm font-bold tracking-[1.5px] uppercase">
              Loading your auctions...
            </span>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Live Auctions Section */}
            {liveAuctions.length > 0 && (
              <section>
                <div className="mb-6 flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-black">
                    <ActivityIcon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase">Live Auctions</h2>
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
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-black">
                    <FileEditIcon className="h-4 w-4 text-[#bbbbbb]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase">Draft Auctions</h2>
                    <p className="text-xs text-[#bbbbbb]">
                      Configure teams, players, and settings before going live
                    </p>
                  </div>
                </div>
                {draftAuctions.length === 0 && auctions && auctions.length > 0 && (
                  <span className="text-xs text-[#bbbbbb]">All auctions are live or completed</span>
                )}
              </div>

              {draftAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center space-y-5 rounded-none border border-dashed border-[#3c3c3c] bg-black py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-2xl">
                    🏆
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white uppercase">No Draft Auctions</h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[#bbbbbb]">
                      Create your first auction to get started. Configure teams, players, and
                      categories before launching.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-6 font-bold tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                  >
                    <PlusIcon className="mr-2 h-4 w-4" />
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
          </div>
        )}
      </main>

      {/* Create Auction Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="flex items-center text-2xl font-black text-white uppercase">
                  <SparklesIcon className="mr-3 h-6 w-6 text-white" />
                  New Auction
                </h2>
                <p className="mt-1 text-sm text-[#bbbbbb]">
                  Configure your auction event before going live
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black p-2 text-[#bbbbbb] hover:text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
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
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
                      Auction Name
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Premier League Cricket 2026"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border-[#3c3c3c] bg-black py-3 text-sm text-white placeholder-[#7e7e7e] focus:border-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="logoUrl"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
                      Auction Logo URL (Optional)
                    </Label>
                    <div className="flex items-center gap-3">
                      {field.state.value && (
                        <ImageViewer
                          src={field.state.value}
                          alt="Logo preview"
                          className="h-12 w-12 rounded-none border border-[#3c3c3c] bg-black object-cover"
                        />
                      )}
                      <Input
                        id={field.name}
                        placeholder="https://example.com/logo.png"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="flex-1 rounded-none border-[#3c3c3c] bg-black py-3 text-sm text-white placeholder-[#7e7e7e] focus:border-white"
                      />
                    </div>
                  </div>
                )}
              />

              <form.Field
                name="budgetPerTeam"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
                      Starting Budget Points per Team
                    </Label>
                    <div className="relative">
                      <CoinsIcon className="absolute top-3 left-3 h-4 w-4 text-[#bbbbbb]" />
                      <Input
                        id={field.name}
                        type="number"
                        placeholder="1000"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="rounded-none border-[#3c3c3c] bg-black py-3 pl-9 text-sm text-white"
                        required
                      />
                    </div>
                  </div>
                )}
              />

              <form.Field
                name="categories"
                mode="array"
                children={(field) => (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white">
                        Categories & Base Points
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => field.pushValue({ name: "", basePoints: 100 })}
                        className="rounded-none border border-[#3c3c3c] bg-black text-xs tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                      >
                        + Add Category
                      </Button>
                    </div>

                    <div className="max-h-[220px] space-y-3 overflow-y-auto pr-1">
                      {field.state.value.map((_, idx) => (
                        <div
                          key={idx}
                          className="flex items-center space-x-3 rounded-none border border-[#3c3c3c] bg-black p-3"
                        >
                          <div className="flex-1">
                            <form.Field
                              name={`categories[${idx}].name`}
                              children={(subField) => (
                                <Input
                                  placeholder="Category Name (e.g. Elite)"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-sm text-white"
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
                                  placeholder="Base pts"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(Number(e.target.value))}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-sm text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              onClick={() => field.removeValue(idx)}
                              className="cursor-pointer px-2 text-red-400 hover:text-red-300"
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
                  className="w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
                >
                  {createAuctionMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2Icon className="h-4 w-4 animate-spin" /> Creating...
                    </span>
                  ) : (
                    "Create Auction & Configure"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AuctionCard({ auction, badge }: { auction: any; badge: "live" | "draft" }) {
  const isLive = badge === "live";

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all duration-300 hover:border-white">
      <div className="p-6">
        {/* Badge + Date */}
        <div className="mb-4 flex items-center justify-between">
          {isLive ? (
            <span className="inline-flex items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
              <span>Live</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black px-3 py-1 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              <FileEditIcon className="h-3 w-3" />
              <span>Draft</span>
            </span>
          )}
          <span className="flex items-center text-xs text-[#bbbbbb]">
            <CalendarIcon className="mr-1 h-3.5 w-3.5" />
            {new Date(auction.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <h3 className="mb-2 text-lg font-black text-white uppercase">{auction.name}</h3>

        {/* Quick stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-none border border-[#3c3c3c] bg-black p-3">
            <span className="block text-[10px] font-bold tracking-widest text-[#bbbbbb] uppercase">
              Budget / Team
            </span>
            <span className="mt-1 flex items-center gap-1 text-sm font-black text-white">
              <CoinsIcon className="h-3.5 w-3.5 text-white" />
              {auction.budgetPerTeam} pts
            </span>
          </div>
          <div className="rounded-none border border-[#3c3c3c] bg-black p-3">
            <span className="block text-[10px] font-bold tracking-widest text-[#bbbbbb] uppercase">
              Slug
            </span>
            <span className="mt-1 block truncate font-mono text-xs font-bold text-[#bbbbbb]">
              {auction.slug}
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="border-t border-[#3c3c3c] bg-[#1a1a1a] px-6 py-4">
        {isLive ? (
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/$auctionId/control"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <GavelIcon className="h-3.5 w-3.5" />
              <span>Control Panel</span>
            </Link>
            <Link
              to="/auction/$auctionId/live"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <PlayCircleIcon className="h-3.5 w-3.5 text-white" />
              <span>Public Arena</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Link
              to="/admin/$auctionId/setup"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <FileEditIcon className="h-3.5 w-3.5 text-[#bbbbbb]" />
              <span>Setup</span>
            </Link>
            <Link
              to="/admin/$auctionId/teams"
              params={{ auctionId: auction.slug }}
              className="flex items-center justify-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-colors hover:bg-white hover:text-black"
            >
              <UsersIcon className="h-3.5 w-3.5 text-[#bbbbbb]" />
              <span>Teams</span>
            </Link>
            <Link
              to="/admin/$auctionId/control"
              params={{ auctionId: auction.slug }}
              className="col-span-2 flex items-center justify-center space-x-1.5 rounded-none border border-white bg-transparent py-2.5 text-center text-xs font-bold tracking-[1.5px] text-white uppercase transition-all hover:bg-white hover:text-black"
            >
              <GavelIcon className="h-3.5 w-3.5" />
              <span>Go to Control Panel</span>
              <ChevronRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
