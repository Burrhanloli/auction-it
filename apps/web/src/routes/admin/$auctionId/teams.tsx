import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  UsersIcon,
  PlusIcon,
  CopyIcon,
  CheckIcon,
  KeyIcon,
  ShieldCheckIcon,
  CoinsIcon,
  RefreshCwIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { $getAuction, $addTeam, $updateTeam } from "#/lib/auction-actions";
import { slugify } from "#/lib/slug";

export const Route = createFileRoute("/admin/$auctionId/teams")({
  component: RosterManagerPage,
});

function generateRandomPasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function RosterManagerPage() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

  // Queries
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  // Copy success indicator state
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  // Edit Team state
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  // TanStack Forms
  const addTeamForm = useForm({
    defaultValues: {
      name: "",
      logoUrl: "",
      ownerName: "",
      ownerImageUrl: "",
      totalBudget: "" as number | "",
      passcode: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Team Name is required");
        return;
      }
      if (!value.ownerName.trim()) {
        toast.error("Owner Name is required");
        return;
      }

      const budgetValue =
        value.totalBudget === "" ? (auction?.budgetPerTeam ?? 1000) : Number(value.totalBudget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        toast.error("Total Budget must be a positive number");
        return;
      }

      // Auto-generate passcode if empty
      let finalPasscode = value.passcode.trim();
      if (!finalPasscode) {
        finalPasscode = generateRandomPasscode();
      }

      if (finalPasscode.length !== 6 || isNaN(Number(finalPasscode))) {
        toast.error("Passcode must be a 6-digit numeric code");
        return;
      }

      addTeamMutation.mutate({
        auctionId,
        name: value.name.trim(),
        logoUrl: value.logoUrl.trim() || null,
        ownerName: value.ownerName.trim(),
        ownerImageUrl: value.ownerImageUrl.trim() || null,
        totalBudget: budgetValue,
        passcode: finalPasscode,
      });
    },
  });

  const editTeamForm = useForm({
    defaultValues: {
      name: "",
      slug: "",
      suffix: "",
      logoUrl: "",
      ownerName: "",
      ownerImageUrl: "",
      totalBudget: "" as number | "",
      passcode: "",
    },
    onSubmit: async ({ value }) => {
      if (!editingTeam) return;

      if (!value.name.trim()) {
        toast.error("Team Name is required");
        return;
      }
      if (!value.slug.trim()) {
        toast.error("Team Slug Prefix is required");
        return;
      }
      if (!value.ownerName.trim()) {
        toast.error("Owner Name is required");
        return;
      }

      const budgetValue =
        value.totalBudget === "" ? (auction?.budgetPerTeam ?? 1000) : Number(value.totalBudget);
      if (isNaN(budgetValue) || budgetValue <= 0) {
        toast.error("Total Budget must be a positive number");
        return;
      }

      if (value.passcode.trim().length !== 6 || isNaN(Number(value.passcode))) {
        toast.error("Passcode must be a 6-digit numeric code");
        return;
      }

      updateTeamMutation.mutate({
        teamId: editingTeam.id,
        slug: value.slug.trim(),
        name: value.name.trim(),
        logoUrl: value.logoUrl.trim() || null,
        ownerName: value.ownerName.trim(),
        ownerImageUrl: value.ownerImageUrl.trim() || null,
        totalBudget: budgetValue,
        passcode: value.passcode.trim(),
      });
    },
  });

  // Generate random 6-digit passcode
  const generatePasscode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    addTeamForm.setFieldValue("passcode", code);
  };

  // Pre-fill budget based on auction settings if empty
  const handleBudgetFocus = () => {
    if (addTeamForm.getFieldValue("totalBudget") === "" && auction) {
      addTeamForm.setFieldValue("totalBudget", auction.budgetPerTeam);
    }
  };

  // Mutations
  const addTeamMutation = useMutation({
    mutationFn: (vars: any) => $addTeam({ data: vars }),
    onSuccess: () => {
      toast.success("Team registered successfully!");
      addTeamForm.reset();
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add team");
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: (vars: any) => $updateTeam({ data: vars }),
    onSuccess: () => {
      toast.success("Team updated successfully!");
      setEditingTeam(null);
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update team");
    },
  });

  const copyToClipboard = (teamId: string, passcodeStr: string, teamName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const strategyUrl = `${origin}/team/${auctionId}?teamId=${teamId}`;
    const shareText = `🎟️ Strategy Deck invitation for team "${teamName}":\n🔗 Link: ${strategyUrl}\n🔑 Access Code: ${passcodeStr}`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedTeamId(teamId);
      toast.success(`Share details copied for "${teamName}"`);
      setTimeout(() => {
        setCopiedTeamId(null);
      }, 2000);
    });
  };

  const teams = auction?.teams ?? [];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Form Area: 1/3 width */}
      <div className="space-y-6 lg:col-span-1">
        <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <h3 className="mb-8 flex items-center text-base font-bold tracking-[1.5px] text-white uppercase">
            <UsersIcon className="mr-2 h-5 w-5 text-white" />
            Add Franchise Team
          </h3>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addTeamForm.handleSubmit();
            }}
            className="space-y-5"
          >
            <addTeamForm.Field
              name="name"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Team Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Knight Riders"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    required
                  />
                </div>
              )}
            />

            <addTeamForm.Field
              name="logoUrl"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Logo Image URL
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="https://example.com/logo.png"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                  />
                </div>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <addTeamForm.Field
                name="ownerName"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Owner Name *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Mukesh Ambani"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <addTeamForm.Field
                name="ownerImageUrl"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Owner Avatar URL
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="https://example.com/owner.png"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    />
                  </div>
                )}
              />
            </div>

            <addTeamForm.Field
              name="totalBudget"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Total Points Budget *
                  </Label>
                  <div className="relative">
                    <CoinsIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                    <Input
                      id={field.name}
                      type="number"
                      placeholder={auction ? `${auction.budgetPerTeam} pts (default)` : "1000"}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onFocus={handleBudgetFocus}
                      className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            />

            <addTeamForm.Field
              name="passcode"
              children={(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    6-Digit Passcode (Strategy Deck)
                  </Label>
                  <div className="flex space-x-2">
                    <div className="relative flex-1">
                      <KeyIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                      <Input
                        id={field.name}
                        type="text"
                        maxLength={6}
                        placeholder="Auto-generated if empty"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-center font-mono text-xs tracking-widest text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generatePasscode}
                      className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-black px-3 text-[#bbbbbb] hover:bg-white hover:text-black"
                      title="Generate Random Passcode"
                    >
                      <RefreshCwIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            />

            <addTeamForm.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || addTeamMutation.isPending}
                  className="mt-2 w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
                >
                  {isSubmitting || addTeamMutation.isPending
                    ? "Registering..."
                    : "Add Franchise Team"}
                </Button>
              )}
            />
          </form>
        </div>
      </div>

      {/* Roster Listing Area: 2/3 width */}
      <div className="space-y-6 lg:col-span-2">
        <div className="flex h-full flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
          <div className="mb-8 flex items-center justify-between border-b border-[#3c3c3c] pb-5">
            <div>
              <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                Registered Roster Teams
              </h3>
              <p className="mt-1 text-[10px] text-[#bbbbbb]">
                Configure, review franchise slots and share passcode keys
              </p>
            </div>
            <span className="rounded-none border border-white bg-white px-3 py-1 text-[10px] font-bold tracking-[1.5px] text-black uppercase">
              {teams.length} Teams Registered
            </span>
          </div>

          <div className="grid max-h-[70vh] grid-cols-1 gap-5 overflow-y-auto pr-1 md:grid-cols-2">
            {teams.map((team: any) => (
              <div
                key={team.id}
                className="flex flex-col justify-between rounded-none border border-[#3c3c3c] bg-black p-6 transition-all hover:border-white"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="h-10 w-10 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-sm font-black text-[#bbbbbb] uppercase">
                          {team.name.slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-black text-white">{team.name}</h4>
                        <span className="mt-0.5 block text-[9px] font-bold tracking-[1.5px] text-white uppercase">
                          {team.remainingBudget} of {team.totalBudget} pts
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          const fullSlug = team.slug || "";
                          let slugPrefix = fullSlug;
                          let slugSuffix = "";
                          const parts = fullSlug.split("-");
                          if (parts.length > 1) {
                            slugSuffix = parts[parts.length - 1];
                            slugPrefix = parts.slice(0, -1).join("-");
                          }
                          editTeamForm.reset({
                            name: team.name,
                            slug: slugPrefix,
                            suffix: slugSuffix,
                            logoUrl: team.logoUrl || "",
                            ownerName: team.ownerName,
                            ownerImageUrl: team.ownerImageUrl || "",
                            totalBudget: team.totalBudget,
                            passcode: team.passcode,
                          });
                        }}
                        className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2 text-[#bbbbbb] hover:bg-white hover:text-black"
                        title="Edit Franchise Details"
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => copyToClipboard(team.id, team.passcode, team.name)}
                        className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-2 text-[#bbbbbb] hover:bg-white hover:text-black"
                        title="Copy Share Link & Passcode"
                      >
                        {copiedTeamId === team.id ? (
                          <CheckIcon className="h-3.5 w-3.5 text-[currentcolor]" />
                        ) : (
                          <CopyIcon className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Staff Info Grid */}
                  <div className="mb-4 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-3 text-[11px]">
                    <div className="space-y-1">
                      <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Franchise Owner
                      </span>
                      <div className="flex items-center space-x-2">
                        {team.ownerImageUrl ? (
                          <img
                            src={team.ownerImageUrl}
                            alt={team.ownerName}
                            className="h-5 w-5 rounded-none border border-[#3c3c3c] bg-black object-cover"
                          />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-[9px]">
                            💼
                          </div>
                        )}
                        <span
                          className="max-w-[80px] truncate font-semibold text-[#bbbbbb]"
                          title={team.ownerName}
                        >
                          {team.ownerName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-3">
                  <div className="flex items-center space-x-1.5">
                    <KeyIcon className="h-3 w-3 text-[#bbbbbb]" />
                    <span className="text-[9px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                      Strategy Passcode:
                    </span>
                  </div>
                  <span className="rounded-none border border-white bg-white px-2.5 py-0.5 font-mono text-xs font-black tracking-[1.5px] text-black uppercase">
                    {team.passcode}
                  </span>
                </div>
              </div>
            ))}

            {teams.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center space-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-black py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                  📋
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                    No Franchise Slots Configured
                  </h4>
                  <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                    Use the Franchise Registration panel on the left to add team owner entries for
                    this auction draft.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Team Dialog Overlay */}
      {editingTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-xl font-bold tracking-[1.5px] text-white uppercase">
                <PencilIcon className="mr-2 h-5 w-5 text-white" />
                Edit Franchise: {editingTeam.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingTeam(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editTeamForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <editTeamForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Team Name *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Knight Riders"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <editTeamForm.Field
                name="slug"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Team URL Slug Prefix * (suffix is read-only)
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        id={field.name}
                        placeholder="e.g. knight-riders"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(slugify(e.target.value))}
                        className="flex-1 rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                        required
                      />
                      <editTeamForm.Subscribe
                        selector={(state) => state.values.suffix}
                        children={(suffixVal) => (
                          <span className="rounded-none border border-[#3c3c3c] bg-black px-3 py-2 font-mono text-xs text-[#bbbbbb] select-none">
                            -{suffixVal || "yyyyy"}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                )}
              />

              <editTeamForm.Field
                name="logoUrl"
                children={(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Logo Image URL
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="https://example.com/logo.png"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    />
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <editTeamForm.Field
                  name="ownerName"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                        Owner Name *
                      </Label>
                      <Input
                        id={field.name}
                        placeholder="e.g. Mukesh Ambani"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                        required
                      />
                    </div>
                  )}
                />

                <editTeamForm.Field
                  name="ownerImageUrl"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                        Owner Avatar URL
                      </Label>
                      <Input
                        id={field.name}
                        placeholder="https://example.com/owner.png"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      />
                    </div>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <editTeamForm.Field
                  name="totalBudget"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                        Total Points Budget *
                      </Label>
                      <div className="relative">
                        <CoinsIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                        <Input
                          id={field.name}
                          type="number"
                          placeholder="1000"
                          value={field.state.value}
                          onChange={(e) =>
                            field.handleChange(e.target.value === "" ? "" : Number(e.target.value))
                          }
                          className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                          required
                        />
                      </div>
                    </div>
                  )}
                />

                <editTeamForm.Field
                  name="passcode"
                  children={(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                        6-Digit Strategy Passcode *
                      </Label>
                      <Input
                        id={field.name}
                        type="text"
                        maxLength={6}
                        placeholder="6-digit numeric"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="rounded-none border border-[#3c3c3c] bg-black text-center font-mono text-xs tracking-widest text-white"
                        required
                      />
                    </div>
                  )}
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTeam(null)}
                  className="flex-1 cursor-pointer rounded-none border border-[#3c3c3c] bg-black py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
                >
                  Cancel
                </Button>
                <editTeamForm.Subscribe
                  selector={(state) => state.isSubmitting}
                  children={(isSubmitting) => (
                    <Button
                      type="submit"
                      disabled={isSubmitting || updateTeamMutation.isPending}
                      className="flex-1 cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
                    >
                      {isSubmitting || updateTeamMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
