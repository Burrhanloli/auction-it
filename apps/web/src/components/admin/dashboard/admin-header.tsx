import { authClient } from "@repo/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOutIcon, MenuIcon, XIcon } from "lucide-react";
import { useState } from "react";

import { Logo } from "#/components/logo";

export function AdminHeader({
  user,
  scrollDirection,
}: {
  user: { name: string } | null;
  scrollDirection: string;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b border-[#3c3c3c] bg-neutral-950 px-4 py-4 transition-transform duration-300 ease-in-out md:px-8 md:py-5 ${
          scrollDirection === "down" ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <MStripeDivider className="absolute right-0 bottom-0 left-0" />
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Link to="/">
              <div className="flex cursor-pointer items-center gap-x-3">
                <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
                  <Logo className="size-5" />
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

          <div className="hidden items-center gap-x-4 md:flex">
            <div className="flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 px-4 py-2">
              <div className="flex size-7 items-center justify-center rounded-none bg-white text-xs font-bold tracking-[1.5px] text-black uppercase">
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
              type="button"
              onClick={async () => {
                await authClient.signOut();
                queryClient.clear();
                navigate({ to: "/login" });
              }}
              className="flex cursor-pointer items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 px-4 py-2 text-sm font-medium tracking-[1.5px] text-[#bbbbbb] uppercase transition-colors hover:bg-white hover:text-black"
            >
              <LogOutIcon className="size-4" />
              <span>Sign Out</span>
            </button>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-60 flex flex-col bg-neutral-950">
          <div className="h-1 w-full bg-linear-to-r from-m-blue-light via-m-blue-dark to-m-red" />
          <div className="flex items-center justify-between border-b border-[#3c3c3c] p-4">
            <div className="flex items-center gap-x-3">
              <div className="flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a]">
                <Logo className="size-5" />
              </div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">Admin</span>
            </div>
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-white"
            >
              <XIcon className="size-6" />
            </button>
          </div>
          <div className="flex flex-1 flex-col gap-y-4 p-6">
            <div className="flex items-center gap-x-3 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4">
              <div className="flex size-10 items-center justify-center rounded-none bg-white text-base font-bold tracking-[1.5px] text-black uppercase">
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
              onClick={async () => {
                setIsMobileMenuOpen(false);
                await authClient.signOut();
                queryClient.clear();
                navigate({ to: "/login" });
              }}
              className="w-full rounded-none border border-transparent bg-white py-6 font-bold tracking-[1.5px] text-black uppercase hover:border-white hover:bg-neutral-950 hover:text-white"
            >
              <LogOutIcon className="mr-2 size-5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
