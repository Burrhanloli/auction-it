import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
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

import { $getAllAuctions, $createAuction } from "#/lib/auction-actions";

export function TopHeader({
  scrollDirection,
  setIsMobileMenuOpen,
}: {
  scrollDirection: string | null;
  setIsMobileMenuOpen: (v: boolean) => void;
}) {
  const { data: user } = useQuery(authQueryOptions());

  return (
    <header
      className={`relative sticky top-0 z-40 border-b border-[#3c3c3c] bg-neutral-950 px-4 py-4 transition-transform duration-300 ease-in-out md:px-8 md:py-5 ${
        scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <MStripeDivider className="absolute right-0 bottom-0 left-0" />
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
            <TrophyIcon className="size-5 text-white" />
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

        <div className="hidden items-center gap-x-2 md:flex">
          {user ? (
            <div className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3 py-1.5">
                <UserIcon className="size-4 text-white" />
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
            <div className="flex items-center gap-x-2">
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
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center justify-center p-2 text-white"
          >
            <MenuIcon className="size-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
