import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet, Link, redirect, useRouterState } from "@tanstack/react-router";
import {
  TrophyIcon,
  SettingsIcon,
  UsersIcon,
  UserPlusIcon,
  TvIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  Loader2Icon,
} from "lucide-react";

import { $getAuction } from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/$auctionId")({
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
  component: AdminLayout,
});

import { useScrollDirection } from "#/hooks/use-scroll-direction";

function AdminLayout() {
  const { auctionId } = Route.useParams();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { scrollDirection } = useScrollDirection();

  // Query details of the current auction to show in the sidebar
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-10 w-10 animate-spin text-white" />
        <span className="text-sm font-bold tracking-[1.5px] uppercase">Loading Control Hub...</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 h-12 w-12 text-white" />
        <h2 className="mb-2 text-xl font-bold text-white uppercase">Arena Not Found</h2>
        <p className="mb-6 text-sm text-[#bbbbbb]">
          The requested auction event key is invalid or has been deleted.
        </p>
        <Link to="/">
          <button className="rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-2 text-xs font-bold tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  const tabs = [
    {
      name: "Auctioneer Panel",
      path: `/admin/${auctionId}/control`,
      icon: TvIcon,
    },
    {
      name: "Roster Manager",
      path: `/admin/${auctionId}/teams`,
      icon: UsersIcon,
    },
    {
      name: "Player Directory",
      path: `/admin/${auctionId}/players`,
      icon: UserPlusIcon,
    },
    {
      name: "Setup Console",
      path: `/admin/${auctionId}/setup`,
      icon: SettingsIcon,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-black font-sans text-white">
      {/* Header bar */}
      <header
        className={`sticky top-0 z-50 flex flex-col justify-between gap-4 border-b border-[#3c3c3c] bg-black px-4 py-4 transition-transform duration-300 ease-in-out md:flex-row md:items-center md:gap-0 md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="flex items-center space-x-4">
          <Link to="/">
            <button className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-[#bbbbbb] hover:bg-white hover:text-black">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
              <TrophyIcon className="h-4.5 w-4.5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                  AUCTION-IT
                </span>
                <span className="text-[10px] font-bold text-[#bbbbbb]">|</span>
                <span className="text-xs font-bold text-white uppercase">{auction.name}</span>
              </div>
              <span className="block text-[8px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                Administrative Control Hub
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link to="/auction/$auctionId/live" params={{ auctionId }}>
            <button className="cursor-pointer rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-4 py-2 text-xs font-bold tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
              Public Arena Live
            </button>
          </Link>
        </div>
      </header>

      {/* Tabs navigation */}
      <div className="no-scrollbar overflow-x-auto border-b border-[#3c3c3c] bg-[#1a1a1a] px-4 md:px-8">
        <div className="mx-auto flex max-w-7xl min-w-max space-x-2 py-3">
          {tabs.map((tab) => {
            const isActive = currentPath === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={`flex items-center space-x-2 rounded-none border border-transparent px-5 py-3 text-sm font-bold tracking-[1.5px] uppercase transition-all duration-150 ${
                  isActive
                    ? "border-white bg-white text-black"
                    : "text-[#bbbbbb] hover:border-[#3c3c3c] hover:bg-black hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main content render area */}
      <div className="relative flex-1 overflow-hidden bg-black">
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
