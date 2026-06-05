import { authClient } from "@repo/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
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
import { Logo } from "#/components/logo";
import { $createAuction } from "#/lib/auction-actions";

export function AdminWelcomeBanner({
  userName,
  onCreateClick,
}: {
  userName: string;
  onCreateClick: () => void;
}) {
  return (
    <div className="mb-12">
      <div className="mb-3 inline-flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-1">
        <LayoutDashboardIcon className="size-3.5 text-white" />
        <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
          Admin Control Center
        </span>
      </div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="inline-flex flex-col">
            <MStripeDivider className="mb-2 w-full" />
            <h1 className="text-4xl font-black tracking-tight text-white uppercase">
              Welcome back, <span className="text-[#bbbbbb]">{userName}</span>
            </h1>
          </div>
          <p className="mt-2 text-[#bbbbbb]">
            Manage your auctions, configure teams and players, and run live bidding sessions.
          </p>
        </div>
        <Button
          onClick={onCreateClick}
          className="flex shrink-0 cursor-pointer items-center gap-x-2 rounded-none border border-white bg-white px-6 py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
        >
          <PlusIcon className="size-5" />
          <span>New Auction</span>
        </Button>
      </div>
    </div>
  );
}
