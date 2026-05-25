import { Link } from "@tanstack/react-router";
import { ShieldCheckIcon } from "lucide-react";
import React from "react";

export function PublicAuctionGuard({
  auction,
  children,
}: {
  auction: { status: string } | null | undefined;
  children: React.ReactNode;
}) {
  if (auction?.status === "draft") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black p-6 text-[#bbbbbb]">
        <ShieldCheckIcon className="mb-4 h-12 w-12 text-white" />
        <h2 className="mb-2 text-xl font-bold tracking-[1.5px] text-white uppercase">
          Arena Not Yet Open
        </h2>
        <p className="mb-6 text-sm text-[#bbbbbb]">
          This auction is currently in Draft Mode and not open to the public.
        </p>
        <Link to="/">
          <button className="cursor-pointer rounded-none border border-white bg-white px-4 py-2 text-xs font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white">
            Back to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
