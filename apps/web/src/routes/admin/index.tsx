import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
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
import { useState, useCallback } from "react";
import { toast } from "sonner";

import { AdminAuctionsList } from "#/components/admin/dashboard/admin-auctions-list";
import { AdminCreateAuctionModal } from "#/components/admin/dashboard/admin-create-auction-modal";
import { AdminHeader } from "#/components/admin/dashboard/admin-header";
import { AdminStatsRow } from "#/components/admin/dashboard/admin-stats-row";
import { AdminWelcomeBanner } from "#/components/admin/dashboard/admin-welcome-banner";
import { AuctionCard } from "#/components/admin/dashboard/auction-card";
import { ImageViewer } from "#/components/image-viewer";
import { Logo } from "#/components/logo";
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
  const { user } = Route.useRouteContext();
  const { scrollDirection } = useScrollDirection();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: auctions, isLoading } = useQuery({
    queryKey: ["my-auctions"],
    queryFn: () => $getAuctionsByUser(),
  });

  const draftAuctions = auctions?.filter((a) => a.status === "draft") ?? [];
  const liveAuctions = auctions?.filter((a) => a.status === "active") ?? [];
  const completedAuctions = auctions?.filter((a) => a.status === "completed") ?? [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 font-sans text-white">
      <AdminHeader user={user} scrollDirection={scrollDirection} />

      <main className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <AdminWelcomeBanner
          userName={user?.name ?? ""}
          onCreateClick={() => setShowCreateModal(true)}
        />

        <AdminStatsRow
          total={auctions?.length ?? 0}
          draft={draftAuctions.length}
          live={liveAuctions.length}
          completed={completedAuctions.length}
        />

        <AdminAuctionsList
          isLoading={isLoading}
          liveAuctions={liveAuctions}
          draftAuctions={draftAuctions}
          completedAuctions={completedAuctions}
          totalAuctionsCount={auctions?.length ?? 0}
          onCreateClick={() => setShowCreateModal(true)}
        />
      </main>

      <AdminCreateAuctionModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
}
