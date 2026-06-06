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

export function MobileMenu({ setIsMobileMenuOpen }: { setIsMobileMenuOpen: (v: boolean) => void }) {
  const { data: user } = useQuery(authQueryOptions());

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-neutral-950">
      <div className="h-1 w-full bg-gradient-to-r from-[#0066b1] via-[#1c69d4] to-[#e22718]" />
      <div className="flex items-center justify-between border-b border-[#3c3c3c] p-4">
        <div className="flex items-center gap-x-2">
          <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
            <TrophyIcon className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
            AUCTION-IT
          </span>
        </div>
        <button type="button" onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white">
          <XIcon className="size-6" />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-6">
        {user ? (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4">
              <UserIcon className="size-5 text-white" />
              <span className="text-base font-medium text-white">{user.name}</span>
            </div>
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full rounded-none border border-[#3c3c3c] bg-[#1a1a1a] py-6 tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black">
                Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-y-4">
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
              <Button
                variant="outline"
                className="w-full rounded-none border border-white bg-transparent py-6 tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
              <Button className="w-full rounded-none border border-transparent bg-white py-6 font-bold tracking-[1.5px] text-black uppercase hover:border-white hover:bg-neutral-950 hover:text-white">
                Register Admin
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
