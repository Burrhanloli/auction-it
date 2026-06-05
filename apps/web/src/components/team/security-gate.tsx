import { Button } from "@repo/ui/components/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/input-otp";
import { Label } from "@repo/ui/components/label";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { Link } from "@tanstack/react-router";
import { ArrowLeftIcon, LockIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SecurityGateProps {
  auction: any;
  auctionId: string;
  activeSelectedTeamId: string;
  setSelectedTeamId: (id: string) => void;
  verifyPasscodeMutation: any;
}

export function SecurityGate({
  auction,
  auctionId,
  activeSelectedTeamId,
  setSelectedTeamId,
  verifyPasscodeMutation,
}: SecurityGateProps) {
  const [passcode, setPasscode] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const currentTeamId = activeSelectedTeamId;
    if (!currentTeamId) {
      toast.error("Please select your Franchise Team");
      return;
    }
    if (passcode.length !== 6) {
      toast.error("Enter the 6-digit access passcode");
      return;
    }

    verifyPasscodeMutation.mutate({
      auctionId,
      teamId: currentTeamId,
      passcode,
    });
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 p-6 text-white">
      <div className="relative w-full max-w-3xl rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        {/* Logo / Header */}
        <div className="gap-y- mb-8 flex flex-col items-center text-center">
          <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
            <LockIcon className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="mb-1 inline-flex flex-col">
              <MStripeDivider className="mb-2 w-full" />
              <h2 className="text-lg font-black tracking-[1.5px] text-white uppercase">
                Strategy Deck Gate
              </h2>
            </div>
            <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-[#bbbbbb]">
              Authenticate with your team credential keys to access private wishlists and bid
              panels.
            </p>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="gap-y-">
          <div className="gap-y-">
            <Label className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Select Franchise Team
            </Label>
            {auction.teams && auction.teams.length > 0 ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {auction.teams.map((t: any) => {
                  const isSelected = activeSelectedTeamId === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`relative flex w-full flex-col items-start rounded-none border p-3.5 text-left transition-all duration-200 select-none ${
                        isSelected
                          ? "border-white bg-neutral-950 ring-1 ring-white"
                          : "border-[#3c3c3c] bg-neutral-950 hover:border-[#bbbbbb] hover:bg-[#1a1a1a]"
                      }`}
                    >
                      {/* Top right status badge */}
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 flex size-4 items-center justify-center rounded-none bg-white text-[10px] font-black text-black">
                          ✓
                        </div>
                      )}

                      <div className="flex w-full items-center gap-x-2">
                        {t.logoUrl ? (
                          <LazyImage
                            src={t.logoUrl}
                            alt={t.name}
                            priority
                            fallbackText={t.name}
                            className="size-8 rounded-none border border-[#3c3c3c] bg-neutral-950 object-contain"
                          />
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-[10px] font-black text-[#bbbbbb] uppercase">
                            {t.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs leading-tight font-black text-white">{t.name}</h5>
                          <span className="mt-0.5 block text-[10px] font-bold text-[#bbbbbb]">
                            Owner: {t.ownerName}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 py-4 text-center text-xs text-[#bbbbbb]">
                No franchise teams registered for this auction.
              </div>
            )}
          </div>

          <div className="gap-y-">
            <Label htmlFor="passcodeInput" className="text-xs font-bold text-[#bbbbbb]">
              6-Digit Passcode
            </Label>
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={passcode}
                onChange={(val) => setPasscode(val)}
                className="gap-2"
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot
                    index={0}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                  <InputOTPSlot
                    index={1}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                  <InputOTPSlot
                    index={2}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                  <InputOTPSlot
                    index={3}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                  <InputOTPSlot
                    index={4}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                  <InputOTPSlot
                    index={5}
                    className="h-14 w-12 rounded-none border border-[#3c3c3c] bg-neutral-950 font-mono text-xl font-bold text-white"
                  />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <Button
            type="submit"
            disabled={verifyPasscodeMutation.isPending || !activeSelectedTeamId}
            className="w-full cursor-pointer rounded-none border border-white bg-white py-3.5 font-black tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#bbbbbb]"
          >
            {verifyPasscodeMutation.isPending ? "Unlocking Deck…" : "Access Strategy Deck 🔓"}
          </Button>
        </form>

        <div className="mt-6 border-t border-[#3c3c3c] pt-4 text-center">
          <Link to="/">
            <span className="flex cursor-pointer items-center justify-center gap-x-2 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:text-white">
              <ArrowLeftIcon className="size-3" />
              <span>Return to Lobby</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
