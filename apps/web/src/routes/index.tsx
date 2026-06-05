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

import { AuctionDirectory } from "#/components/home/auction-directory";
import { CreateAuctionModal } from "#/components/home/create-auction-modal";
import { HeroBanner } from "#/components/home/hero-banner";
import { MobileMenu } from "#/components/home/mobile-menu";
import { TopHeader } from "#/components/home/top-header";
import { useScrollDirection } from "#/hooks/use-scroll-direction";
import { $getAllAuctions, $createAuction } from "#/lib/auction-actions";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const { scrollDirection } = useScrollDirection();

  // State for creating a new auction
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-neutral-950 font-sans text-white">
      <TopHeader scrollDirection={scrollDirection} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {isMobileMenuOpen && <MobileMenu setIsMobileMenuOpen={setIsMobileMenuOpen} />}

      <HeroBanner setShowCreateForm={setShowCreateForm} />

      {showCreateForm && <CreateAuctionModal setShowCreateForm={setShowCreateForm} />}

      <AuctionDirectory setShowCreateForm={setShowCreateForm} />
    </div>
  );
}
