import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { LazyImage } from "@repo/ui/components/lazy-image";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  UsersIcon,
  PlusIcon,
  KeyIcon,
  CoinsIcon,
  RefreshCwIcon,
  PencilIcon,
  XIcon,
} from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "#/components/image-upload";
import { ImageViewer } from "#/components/image-viewer";
import {
  $getAuction,
  $addTeam,
  $updateTeam,
  $addTeamsBulk,
  $deleteTeam,
} from "#/lib/auction-actions";
import { slugify } from "#/lib/slug";

export const Route = createFileRoute("/admin/$auctionId/teams")({
  component: TeamsConsolePage,
});

function generateRandomPasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const downloadSampleCsv = () => {
  const csvContent =
    "Team Name,Owner Name,Total Budget,Logo URL,Owner Image URL\nSample Team,John Doe,1000,,\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "teams_sample.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

function TeamsConsolePage() {
  const { auctionId } = Route.useParams();

  // Queries
  const { data: auction } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  // Edit Team state
  const [editingTeam, setEditingTeam] = useState<any>(null);

  const teams = auction?.teams ?? [];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
      {/* Form Area: 1/3 width */}
      {auction?.status !== "completed" ? (
        <div className="gap-y-4 lg:col-span-1">
          <AddTeamForm auctionId={auctionId} auction={auction} />
          <BulkUploadTeams auctionId={auctionId} auction={auction} />
        </div>
      ) : (
        <div className="gap-y-4 lg:col-span-1">
          <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 p-8 text-center">
            <div className="mb-3 flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
              🔒
            </div>
            <h4 className="text-xs font-bold tracking-[1.5px] text-white uppercase">
              Auction Completed
            </h4>
            <p className="mt-1 text-[10px] text-[#bbbbbb]">Franchise registration is locked.</p>
          </div>
        </div>
      )}

      {/* Roster Listing Area: 2/3 width */}
      <div className="gap-y-4 lg:col-span-2">
        <TeamList
          teams={teams}
          auction={auction}
          auctionId={auctionId}
          setEditingTeam={setEditingTeam}
        />
      </div>

      {/* Edit Team Dialog Overlay */}
      {editingTeam && (
        <EditTeamDialog
          editingTeam={editingTeam}
          setEditingTeam={setEditingTeam}
          auctionId={auctionId}
          auction={auction}
        />
      )}
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function AddTeamForm({ auctionId, auction }: { auctionId: string; auction: any }) {
  const queryClient = useQueryClient();

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

  const generatePasscode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    addTeamForm.setFieldValue("passcode", code);
  };

  const handleBudgetFocus = () => {
    if (addTeamForm.getFieldValue("totalBudget") === "" && auction) {
      addTeamForm.setFieldValue("totalBudget", auction.budgetPerTeam);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-8 flex items-center">
        <UsersIcon className="mr-3 size-5 text-white" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
            Add Franchise Team
          </h3>
        </div>
      </div>

      {/* react-doctor-disable-next-line react-doctor/no-prevent-default */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addTeamForm.handleSubmit();
        }}
        className="flex flex-col gap-y-4"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Details */}
          <div className="flex flex-col gap-y-4 md:col-span-2">
            <addTeamForm.Field
              name="name"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Team Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Knight Riders"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    required
                  />
                </div>
              )}
            />

            <addTeamForm.Field
              name="ownerName"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Owner Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Mukesh Ambani"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    required
                  />
                </div>
              )}
            />

            <addTeamForm.Field
              name="totalBudget"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Total Points Budget *
                  </Label>
                  <div className="relative">
                    <CoinsIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
                    <Input
                      id={field.name}
                      type="number"
                      placeholder={auction ? `${auction.budgetPerTeam} pts (default)` : "1000"}
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      onFocus={handleBudgetFocus}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
                    />
                  </div>
                </div>
              )}
            />

            <addTeamForm.Field
              name="passcode"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    6-Digit Passcode (Strategy Deck)
                  </Label>
                  <div className="flex gap-x-2">
                    <div className="relative flex-1">
                      <KeyIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
                      <Input
                        id={field.name}
                        type="text"
                        maxLength={6}
                        placeholder="Auto-generated if empty"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-center font-mono text-xs tracking-widest text-white"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generatePasscode}
                      className="flex cursor-pointer items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 text-[#bbbbbb] hover:bg-white hover:text-black"
                      title="Generate Random Passcode"
                    >
                      <RefreshCwIcon className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            />
          </div>

          {/* Media Sidebar */}
          <div className="flex flex-col gap-y-4 md:col-span-1">
            <addTeamForm.Field
              name="logoUrl"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Logo Image (Auto-converts to WebP)
                  </Label>
                  <ImageUpload
                    id={field.name}
                    value={field.state.value}
                    onChange={(url) => field.handleChange(url)}
                    className="mt-2"
                  />
                </div>
              )}
            />

            <addTeamForm.Field
              name="ownerImageUrl"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Owner Avatar (Auto-converts to WebP)
                  </Label>
                  <ImageUpload
                    id={field.name}
                    value={field.state.value}
                    onChange={(url) => field.handleChange(url)}
                    className="mt-2"
                  />
                </div>
              )}
            />
          </div>
        </div>

        <addTeamForm.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting || addTeamMutation.isPending}
              className="mt-4 w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
            >
              {isSubmitting || addTeamMutation.isPending ? "Registering…" : "Add Franchise Team"}
            </Button>
          )}
        />
      </form>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function BulkUploadTeams({ auctionId, auction }: { auctionId: string; auction: any }) {
  const queryClient = useQueryClient();

  const addTeamsBulkMutation = useMutation({
    mutationFn: (vars: any) => $addTeamsBulk({ data: vars }),
    onSuccess: (data) => {
      toast.success(`Successfully added ${data.count} teams!`);
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      const fileInput = document.getElementById("team-csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to bulk add teams");
      const fileInput = document.getElementById("team-csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedTeams = results.data.flatMap((row: any) => {
          const t = {
            name: row["Team Name"] || row.name,
            ownerName: row["Owner Name"] || row.ownerName,
            totalBudget:
              row["Total Budget"] || row.totalBudget
                ? Number(row["Total Budget"] || row.totalBudget)
                : (auction?.budgetPerTeam ?? 1000),
            passcode: generateRandomPasscode(),
            logoUrl: row["Logo URL"] || row.logoUrl || null,
            ownerImageUrl: row["Owner Image URL"] || row.ownerImageUrl || null,
          };
          return t.name && t.ownerName ? [t] : [];
        });

        if (parsedTeams.length === 0) {
          toast.error(
            "No valid teams found in CSV. Please ensure 'Team Name' and 'Owner Name' columns exist.",
          );
          return;
        }

        addTeamsBulkMutation.mutate({
          auctionId,
          teams: parsedTeams,
        });
      },
      error: (error: any) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  return (
    <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-6 flex items-center">
        <PlusIcon className="mr-3 size-5 text-white" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
            Bulk Upload Teams
          </h3>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="space-y-1.5">
          <Label htmlFor="team-csv-upload" className="text-xs text-[#bbbbbb]">
            Upload CSV File
          </Label>
          <Input
            id="team-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={addTeamsBulkMutation.isPending}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white file:mr-4 file:border-0 file:bg-[#3c3c3c] file:px-4 file:py-1 file:text-xs file:text-white file:uppercase hover:file:bg-white hover:file:text-black"
          />
        </div>
        <button
          type="button"
          onClick={downloadSampleCsv}
          className="text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase underline hover:text-white"
        >
          Download Sample CSV
        </button>
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function TeamList({
  teams,
  auction,
  auctionId,
  setEditingTeam,
}: {
  teams: any[];
  auction: any;
  auctionId: string;
  setEditingTeam: (team: any) => void;
}) {
  const queryClient = useQueryClient();
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);

  const deleteTeamMutation = useMutation({
    mutationFn: (vars: any) => $deleteTeam({ data: vars }),
    onSuccess: () => {
      toast.success("Team deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete team");
    },
  });

  const copyToClipboard = (teamId: string, passcodeStr: string, teamName: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const strategyUrl = `${origin}/team/${auctionId}?teamId=${teamId}`;
    const shareText = `👋 Hello ${teamName} Owner!\n\nHere is your exclusive access to the Auction Strategy Deck. You can use this portal to manage your player wishlist, monitor your remaining budget, and track your squad live during the auction draft.\n\n🔗 Strategy Portal: ${strategyUrl}\n🔑 Your Secret Passcode: ${passcodeStr}\n\nBest of luck with building your team! 🏆`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopiedTeamId(teamId);
      toast.success(`Share details copied for "${teamName}"`);
      setTimeout(() => {
        setCopiedTeamId(null);
      }, 2000);
    });
  };

  return (
    <div className="flex flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
      <div className="mb-8 flex items-center justify-between border-b border-[#3c3c3c] pb-5">
        <div>
          <div className="inline-flex flex-col">
            <MStripeDivider className="mb-1 w-full" />
            <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
              Registered Roster Teams
            </h3>
          </div>
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
            className="relative flex flex-col overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] transition-all hover:border-[#7e7e7e]"
          >
            {/* Top Section: Compact Full Bleed Image */}
            <div className="relative aspect-[3/4] max-h-64 w-full shrink-0 bg-neutral-950">
              {team.logoUrl ? (
                <ImageViewer
                  src={team.logoUrl}
                  alt={team.name}
                  className="absolute inset-0 size-full object-contain"
                  triggerClassName="absolute inset-0 size-full block"
                />
              ) : (
                <div className="absolute inset-0 flex size-full items-center justify-center bg-neutral-950 text-[48px] font-bold tracking-tight text-white uppercase">
                  {team.name.slice(0, 2)}
                </div>
              )}
              {/* M-Stripe Divider */}
              <MStripeDivider className="absolute right-0 bottom-0 left-0" />
            </div>

            {/* Content Section */}
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-4">
                <span className="mb-1 block text-[12px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                  {team.remainingBudget} / {team.totalBudget} PTS LEFT
                </span>
                <h4
                  className="line-clamp-2 text-[24px] leading-[1.1] font-bold text-white uppercase"
                  title={team.name}
                >
                  {team.name}
                </h4>
              </div>

              <div className="mt-auto flex flex-col gap-2">
                {/* Owner Details */}
                <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-2">
                  <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                    Owner
                  </span>
                  <div className="flex items-center gap-1.5">
                    {team.ownerImageUrl ? (
                      <LazyImage
                        src={team.ownerImageUrl}
                        alt={team.ownerName}
                        fallbackText={team.ownerName}
                        className="size-5 rounded-none object-contain grayscale"
                      />
                    ) : (
                      <div className="flex size-5 items-center justify-center bg-[#2b2b2b] text-[10px]">
                        💼
                      </div>
                    )}
                    <span className="line-clamp-1 text-[14px] font-light text-white">
                      {team.ownerName}
                    </span>
                  </div>
                </div>

                {/* Passcode Details */}
                <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-2">
                  <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                    Passcode
                  </span>
                  <span className="text-[14px] font-bold tracking-[1px] text-white uppercase">
                    {team.passcode}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="mt-2 flex w-full gap-x-2">
                  {auction?.status === "draft" && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditingTeam(team)}
                        className="flex h-[36px] flex-1 items-center justify-center border border-white bg-transparent text-[12px] font-bold tracking-[1px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                        title="Edit Details"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this franchise?")) {
                            deleteTeamMutation.mutate({ teamId: team.id });
                          }
                        }}
                        disabled={deleteTeamMutation.isPending}
                        className="flex h-[36px] flex-1 items-center justify-center border border-[#e22718] bg-transparent text-[12px] font-bold tracking-[1px] text-[#e22718] uppercase transition-colors hover:bg-[#e22718] hover:text-white disabled:opacity-50"
                        title="Delete Franchise"
                      >
                        Delete
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => copyToClipboard(team.id, team.passcode, team.name)}
                    className="flex h-[36px] flex-1 items-center justify-center border border-transparent bg-white text-[12px] font-bold tracking-[1px] text-black uppercase transition-colors hover:bg-[#e6e6e6]"
                    title="Copy Share Link & Passcode"
                  >
                    {copiedTeamId === team.id ? "Copied" : "Copy Invite"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {teams.length === 0 && (
          <div className="col-span-2 flex flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
              📋
            </div>
            <div>
              <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                No Franchise Slots Configured
              </h4>
              <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                Use the Franchise Registration panel on the left to add team owner entries for this
                auction draft.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function EditTeamDialog({
  editingTeam,
  setEditingTeam,
  auctionId,
  auction,
}: {
  editingTeam: any;
  setEditingTeam: (team: any) => void;
  auctionId: string;
  auction: any;
}) {
  const queryClient = useQueryClient();

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

  const fullSlug = editingTeam.slug || "";
  let initialSlugPrefix = fullSlug;
  let initialSlugSuffix = "";
  const parts = fullSlug.split("-");
  if (parts.length > 1) {
    initialSlugSuffix = parts[parts.length - 1];
    initialSlugPrefix = parts.slice(0, -1).join("-");
  }

  const editTeamForm = useForm({
    defaultValues: {
      name: editingTeam.name || "",
      slug: initialSlugPrefix || "",
      suffix: initialSlugSuffix || "",
      logoUrl: editingTeam.logoUrl || "",
      ownerName: editingTeam.ownerName || "",
      ownerImageUrl: editingTeam.ownerImageUrl || "",
      totalBudget: editingTeam.totalBudget || "",
      passcode: editingTeam.passcode || "",
    },
    onSubmit: async ({ value }) => {
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

      if (String(value.passcode).trim().length !== 6 || isNaN(Number(value.passcode))) {
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
        passcode: String(value.passcode).trim(),
      });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold tracking-[1.5px] text-white uppercase">
            <PencilIcon className="mr-2 size-5 text-white" />
            Edit Franchise: {editingTeam.name}
          </h2>
          <button
            type="button"
            onClick={() => setEditingTeam(null)}
            className="cursor-pointer text-[#bbbbbb] hover:text-white"
          >
            <XIcon className="size-5" />
          </button>
        </div>

        {/* react-doctor-disable-next-line react-doctor/no-prevent-default */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editTeamForm.handleSubmit();
          }}
          className="flex flex-col gap-y-4"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Main Details */}
            <div className="flex flex-col gap-y-4 md:col-span-2">
              <editTeamForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Team Name *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Knight Riders"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <editTeamForm.Field
                name="slug"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Team URL Slug Prefix * (suffix is read-only)
                    </Label>
                    <div className="flex items-center gap-x-2">
                      <Input
                        id={field.name}
                        placeholder="e.g. knight-riders"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(slugify(e.target.value))}
                        className="flex-1 rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                        required
                      />
                      <editTeamForm.Subscribe
                        selector={(state) => state.values.suffix}
                        children={(suffixVal) => (
                          <span className="rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-2 font-mono text-xs text-[#bbbbbb] select-none">
                            -{suffixVal || "yyyyy"}
                          </span>
                        )}
                      />
                    </div>
                  </div>
                )}
              />

              <editTeamForm.Field
                name="ownerName"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Owner Name *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Mukesh Ambani"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <editTeamForm.Field
                name="totalBudget"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Total Points Budget *
                    </Label>
                    <div className="relative">
                      <CoinsIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
                      <Input
                        id={field.name}
                        type="number"
                        placeholder="1000"
                        value={field.state.value}
                        onChange={(e) =>
                          field.handleChange(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
                        required
                      />
                    </div>
                  </div>
                )}
              />

              <editTeamForm.Field
                name="passcode"
                children={(field) => (
                  <div className="space-y-1.5">
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
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-center font-mono text-xs tracking-widest text-white"
                      required
                    />
                  </div>
                )}
              />
            </div>

            {/* Media Sidebar */}
            <div className="flex flex-col gap-y-4 md:col-span-1">
              <editTeamForm.Field
                name="logoUrl"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Logo Image (Auto-converts to WebP)
                    </Label>
                    <ImageUpload
                      id={field.name}
                      value={field.state.value}
                      onChange={(url) => field.handleChange(url)}
                      className="mt-2"
                    />
                  </div>
                )}
              />

              <editTeamForm.Field
                name="ownerImageUrl"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Owner Avatar (Auto-converts to WebP)
                    </Label>
                    <ImageUpload
                      id={field.name}
                      value={field.state.value}
                      onChange={(url) => field.handleChange(url)}
                      className="mt-2"
                    />
                  </div>
                )}
              />
            </div>
          </div>

          <div className="flex gap-x-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingTeam(null)}
              className="flex-1 cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
            >
              Cancel
            </Button>
            <editTeamForm.Subscribe
              selector={(state) => state.isSubmitting}
              children={(isSubmitting) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || updateTeamMutation.isPending}
                  className="flex-1 cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
                >
                  {isSubmitting || updateTeamMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
