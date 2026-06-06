import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
/* react-doctor-disable react-doctor/no-multi-comp */
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlusIcon, SearchIcon, Loader2Icon, PlusIcon, PencilIcon, XIcon } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "#/components/image-upload";
import { PlayerCard } from "#/components/player-card";
import {
  $getAuction,
  $addPlayer,
  $addPlayersBulk,
  $updatePlayer,
  $deletePlayer,
} from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/$auctionId/players")({
  component: PlayersConsolePage,
});

// react-doctor-disable-next-line react-doctor/prefer-useReducer
function PlayersConsolePage() {
  const { auctionId } = Route.useParams();
  const queryClient = useQueryClient();

  // Responsive mobile form display toggle
  const [showMobileForm, setShowMobileForm] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilterCategory, setSelectedFilterCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all"); // all, sold, unsold

  // Edit Player state
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

  // Queries
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  // TanStack Form
  const addPlayerForm = useForm({
    defaultValues: {
      name: "",
      skills: "",
      categoryId: "",
      imageUrl: "",
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Player Name is required");
        return;
      }
      if (!value.skills.trim()) {
        toast.error("Player Skills are required");
        return;
      }
      const categoryId = value.categoryId || auction?.categories?.[0]?.id;
      if (!categoryId) {
        toast.error("Please select a category for the player");
        return;
      }

      addPlayerMutation.mutate({
        auctionId,
        categoryId,
        name: value.name.trim(),
        skills: value.skills.trim(),
        imageUrl: value.imageUrl.trim() || null,
      });
    },
  });

  const editPlayerForm = useForm({
    defaultValues: {
      name: "",
      skills: "",
      categoryId: "",
      imageUrl: "",
    },
    onSubmit: async ({ value }) => {
      if (!editingPlayer) return;
      if (!value.name.trim()) {
        toast.error("Player Name is required");
        return;
      }
      if (!value.skills.trim()) {
        toast.error("Player Skills are required");
        return;
      }
      const categoryId = value.categoryId || auction?.categories?.[0]?.id;
      if (!categoryId) {
        toast.error("Please select a category for the player");
        return;
      }

      updatePlayerMutation.mutate({
        playerId: editingPlayer.id,
        categoryId,
        name: value.name.trim(),
        skills: value.skills.trim(),
        imageUrl: value.imageUrl.trim() || null,
      });
    },
  });

  // Mutation
  const addPlayerMutation = useMutation({
    mutationFn: (vars: any) => $addPlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Player added to roster successfully!");
      // Reset form
      const currentCatId = addPlayerForm.getFieldValue("categoryId");
      addPlayerForm.reset();
      if (currentCatId) {
        addPlayerForm.setFieldValue("categoryId", currentCatId);
      }
      // Collapse form on mobile after successful add
      setShowMobileForm(false);
      // Refetch
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add player");
    },
  });

  const updatePlayerMutation = useMutation({
    mutationFn: (vars: any) => $updatePlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Player updated successfully!");
      setEditingPlayer(null);
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update player");
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: (vars: any) => $deletePlayer({ data: vars }),
    onSuccess: () => {
      toast.success("Player deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete player");
    },
  });

  const addPlayersBulkMutation = useMutation({
    mutationFn: (vars: any) => $addPlayersBulk({ data: vars }),
    onSuccess: (data) => {
      toast.success(`Successfully added ${data.count} players!`);
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      const fileInput = document.getElementById("player-csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to bulk add players");
      const fileInput = document.getElementById("player-csv-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 size-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Syncing Roster Registry…
        </span>
      </div>
    );
  }

  const players = auction?.players ?? [];
  const categories = auction?.categories ?? [];

  // Filter players list
  const filteredPlayers = players.filter((player: any) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      player.skills.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedFilterCategory === "all" || player.categoryId === selectedFilterCategory;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "sold" && (player.status === "sold" || player.status === "captain")) ||
      (statusFilter === "unsold" && player.status === "unsold");

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Compute stats
  const totalCount = players.length;
  const soldCount = players.filter(
    (p: any) => p.status === "sold" || p.status === "captain",
  ).length;
  const unsoldCount = players.filter((p: any) => p.status === "unsold").length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-1 sm:px-4">
      {/* Mobile Form Toggler Button */}
      {auction?.status !== "completed" && (
        <div className="block w-full lg:hidden">
          <Button
            onClick={() => setShowMobileForm(!showMobileForm)}
            className="flex w-full items-center justify-center gap-x-2 rounded-none border border-white bg-white px-4 py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
          >
            <UserPlusIcon className="size-4" />
            <span>{showMobileForm ? "Close Registration Form" : "Register Roster Player"}</span>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Left Column: Register Player Form & Stats */}
        <div
          className={`lg:flex lg:flex-col ${showMobileForm ? "flex flex-col" : "hidden"} w-full gap-y-4 lg:col-span-1`}
        >
          <StatsGrid totalCount={totalCount} soldCount={soldCount} unsoldCount={unsoldCount} />

          {auction?.status !== "completed" ? (
            <>
              <RegisterPlayerForm
                addPlayerForm={addPlayerForm}
                addPlayerMutation={addPlayerMutation}
                categories={categories}
              />

              <BulkUploadForm
                auctionId={auctionId}
                categories={categories}
                addPlayersBulkMutation={addPlayersBulkMutation}
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 p-8 text-center">
              <div className="mb-3 flex size-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                🔒
              </div>
              <h4 className="text-xs font-bold tracking-[1.5px] text-white uppercase">
                Auction Completed
              </h4>
              <p className="mt-1 text-[10px] text-[#bbbbbb]">Player registration is locked.</p>
            </div>
          )}
        </div>

        {/* Right Area: Interactive Search & Directory */}
        <PlayerDirectory
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedFilterCategory={selectedFilterCategory}
          setSelectedFilterCategory={setSelectedFilterCategory}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          filteredPlayers={filteredPlayers}
          categories={categories}
          auction={auction}
          setEditingPlayer={setEditingPlayer}
          editPlayerForm={editPlayerForm}
          deletePlayerMutation={deletePlayerMutation}
        />
      </div>

      {/* Edit Player Dialog Overlay */}
      {editingPlayer && (
        <EditPlayerModal
          editingPlayer={editingPlayer}
          setEditingPlayer={setEditingPlayer}
          editPlayerForm={editPlayerForm}
          updatePlayerMutation={updatePlayerMutation}
          categories={categories}
        />
      )}
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function StatsGrid({
  totalCount,
  soldCount,
  unsoldCount,
}: {
  totalCount: number;
  soldCount: number;
  unsoldCount: number;
}) {
  return (
    <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
      <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-3 text-center sm:p-4">
        <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
          Total Roster
        </span>
        <span className="mt-1 block text-lg font-black text-white sm:text-xl">{totalCount}</span>
      </div>
      <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-3 text-center sm:p-4">
        <span className="block text-[8px] font-bold tracking-[1.5px] text-white uppercase">
          Sold squad
        </span>
        <span className="mt-1 block text-lg font-black text-white sm:text-xl">{soldCount}</span>
      </div>
      <div className="rounded-none border border-[#3c3c3c] bg-neutral-950 p-3 text-center sm:p-4">
        <span className="block text-[8px] font-bold tracking-[1.5px] text-white uppercase">
          Unsold Left
        </span>
        <span className="mt-1 block text-lg font-black text-white sm:text-xl">{unsoldCount}</span>
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function RegisterPlayerForm({
  addPlayerForm,
  addPlayerMutation,
  categories,
}: {
  addPlayerForm: any;
  addPlayerMutation: any;
  categories: any[];
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 sm:p-8">
      <div className="mb-6 flex items-center">
        <UserPlusIcon className="mr-3 size-5 text-white" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
            Register Roster Player
          </h3>
        </div>
      </div>

      {/* react-doctor-disable-next-line react-doctor/no-prevent-default */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addPlayerForm.handleSubmit();
        }}
        className="flex flex-col gap-y-4"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Details */}
          <div className="flex flex-col gap-y-4 md:col-span-2">
            <addPlayerForm.Field name="name">
              {(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Player Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Virat Kohli"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    required
                  />
                </div>
              )}
            </addPlayerForm.Field>

            <addPlayerForm.Field name="skills">
              {(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Primary Skills *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Right-hand Batsman, Medium Pacer"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    required
                  />
                </div>
              )}
            </addPlayerForm.Field>

            <addPlayerForm.Field name="categoryId">
              {(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Auction Category Deck *
                  </Label>
                  <select
                    id={field.name}
                    value={field.state.value || categories[0]?.id || ""}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5 text-xs text-white outline-none focus:border-white"
                    required
                  >
                    {categories.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (Base: {cat.basePoints} pts)
                      </option>
                    ))}
                    {categories.length === 0 && (
                      <option value="" disabled>
                        No categories found - configure under Setup first!
                      </option>
                    )}
                  </select>
                </div>
              )}
            </addPlayerForm.Field>
          </div>

          {/* Media Sidebar */}
          <div className="flex flex-col gap-y-4 md:col-span-1">
            <addPlayerForm.Field name="imageUrl">
              {(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Player Photo (Auto-converts to WebP)
                  </Label>
                  <ImageUpload
                    id={field.name}
                    value={field.state.value}
                    onChange={(url) => field.handleChange(url)}
                    className="mt-2"
                  />
                </div>
              )}
            </addPlayerForm.Field>
          </div>
        </div>

        <addPlayerForm.Subscribe
          selector={(state: any) => state.isSubmitting}
          children={(isSubmitting: boolean) => (
            <Button
              type="submit"
              disabled={isSubmitting || addPlayerMutation.isPending || categories.length === 0}
              className="mt-4 w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
            >
              {isSubmitting || addPlayerMutation.isPending
                ? "Adding Player…"
                : "Add Player to Roster"}
            </Button>
          )}
        />
      </form>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function BulkUploadForm({
  auctionId,
  categories,
  addPlayersBulkMutation,
}: {
  auctionId: string;
  categories: any[];
  addPlayersBulkMutation: any;
}) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedPlayers = results.data.flatMap((row: any) => {
          const categoryName = row["Category Name"] || row.categoryName || row.category;
          const matchedCategory = categories.find(
            (c: any) => c.name.toLowerCase() === (categoryName || "").toLowerCase(),
          );

          const p = {
            name: row["Player Name"] || row.name,
            skills: row["Skills"] || row.skills,
            categoryId: matchedCategory?.id || categories[0]?.id,
            imageUrl: row["Image URL"] || row.imageUrl || null,
          };
          return p.name && p.skills && p.categoryId ? [p] : [];
        });

        if (parsedPlayers.length === 0) {
          toast.error(
            "No valid players found in CSV. Please ensure 'Player Name' and 'Skills' columns exist.",
          );
          return;
        }

        addPlayersBulkMutation.mutate({
          auctionId,
          players: parsedPlayers,
        });
      },
      error: (error: any) => {
        toast.error(`Error parsing CSV: ${error.message}`);
      },
    });
  };

  const downloadSampleCsv = () => {
    const defaultCatName = categories[0]?.name || "Elite";
    const csvContent = `Player Name,Skills,Category Name,Image URL\nSample Player,Right-hand Batsman,${defaultCatName},\n`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "players_sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 sm:p-8">
      <div className="mb-6 flex items-center">
        <PlusIcon className="mr-3 size-5 text-white" />
        <div className="inline-flex flex-col">
          <MStripeDivider className="mb-2 w-full" />
          <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
            Bulk Upload Players
          </h3>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="space-y-1.5">
          <Label htmlFor="player-csv-upload" className="text-xs text-[#bbbbbb]">
            Upload CSV File
          </Label>
          <Input
            id="player-csv-upload"
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={addPlayersBulkMutation.isPending || categories.length === 0}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white file:mr-4 file:border-0 file:bg-[#3c3c3c] file:px-4 file:py-1 file:text-xs file:text-white file:uppercase hover:file:bg-white hover:file:text-black"
          />
        </div>
        <button
          type="button"
          onClick={downloadSampleCsv}
          disabled={categories.length === 0}
          className="text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase underline hover:text-white disabled:opacity-50"
        >
          Download Sample CSV
        </button>
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function PlayerDirectory({
  searchTerm,
  setSearchTerm,
  selectedFilterCategory,
  setSelectedFilterCategory,
  statusFilter,
  setStatusFilter,
  filteredPlayers,
  categories,
  auction,
  setEditingPlayer,
  editPlayerForm,
  deletePlayerMutation,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  selectedFilterCategory: string;
  setSelectedFilterCategory: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  filteredPlayers: any[];
  categories: any[];
  auction: any;
  setEditingPlayer: (p: any) => void;
  editPlayerForm: any;
  deletePlayerMutation: any;
}) {
  return (
    <div className="w-full gap-y-4 lg:col-span-2">
      <div className="flex w-full flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4 sm:p-6 md:p-8">
        {/* Header & Filter Controls */}
        <div className="mb-6 w-full gap-y-4 border-b border-[#3c3c3c] pb-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="inline-flex flex-col">
                <MStripeDivider className="mb-1 w-full" />
                <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
                  Roster Registry
                </h3>
              </div>
              <p className="mt-1 text-[10px] text-[#bbbbbb]">
                Search, filter, and track player draft allocations
              </p>
            </div>

            {/* Status Pills */}
            <div className="flex w-auto self-start rounded-none border border-[#3c3c3c] bg-neutral-950 p-1">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`cursor-pointer rounded-none px-3 py-1 text-[9px] font-black tracking-[1.5px] uppercase transition-colors ${
                  statusFilter === "all" ? "bg-white text-black" : "text-[#bbbbbb] hover:text-white"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("unsold")}
                className={`cursor-pointer rounded-none px-3 py-1 text-[9px] font-black tracking-[1.5px] uppercase transition-colors ${
                  statusFilter === "unsold"
                    ? "border border-white bg-white text-black"
                    : "text-[#bbbbbb] hover:text-white"
                }`}
              >
                Unsold
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("sold")}
                className={`cursor-pointer rounded-none px-3 py-1 text-[9px] font-black tracking-[1.5px] uppercase transition-colors ${
                  statusFilter === "sold"
                    ? "border border-white bg-white text-black"
                    : "text-[#bbbbbb] hover:text-white"
                }`}
              >
                Sold
              </button>
            </div>
          </div>

          {/* Search Input and Category Selector Grid */}
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3">
            <div className="relative md:col-span-2">
              <SearchIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
              <Input
                placeholder="Search player name or skills…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
              />
            </div>

            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value)}
              className="w-full rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5 text-xs text-white outline-none focus:border-white"
            >
              <option value="all">All Category Decks</option>
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} Category
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Directory Listings - Desktop scroll locked, mobile inline flowing */}
        <div className="grid w-full grid-cols-1 gap-6 pr-1 md:grid-cols-2 lg:max-h-[68vh] lg:overflow-y-auto">
          {filteredPlayers.map((player: any) => (
            <PlayerCard
              key={player.id}
              player={player}
              variant="admin"
              auctionStatus={auction?.status}
              onEdit={(p: any) => {
                setEditingPlayer(p);
                editPlayerForm.setFieldValue("name", p.name);
                editPlayerForm.setFieldValue("skills", p.skills);
                editPlayerForm.setFieldValue("categoryId", p.categoryId);
                editPlayerForm.setFieldValue("imageUrl", p.imageUrl || "");
              }}
              onDelete={(id: any) => deletePlayerMutation.mutate({ playerId: id })}
              isDeleting={deletePlayerMutation.isPending}
            />
          ))}

          {filteredPlayers.length === 0 && (
            <div className="col-span-1 flex flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-16 text-center md:col-span-2">
              <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                👤
              </div>
              <div>
                <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                  No Matching Roster Entries
                </h4>
                <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                  Try adjusting your search queries or register a new player deck in the setup form.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// react-doctor-disable-next-line react-doctor/no-multi-comp
function EditPlayerModal({
  editingPlayer,
  setEditingPlayer,
  editPlayerForm,
  updatePlayerMutation,
  categories,
}: {
  editingPlayer: any;
  setEditingPlayer: (p: any) => void;
  editPlayerForm: any;
  updatePlayerMutation: any;
  categories: any[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-xl font-bold tracking-[1.5px] text-white uppercase">
            <PencilIcon className="mr-2 size-5 text-white" />
            Edit Player: {editingPlayer.name}
          </h2>
          <button
            type="button"
            onClick={() => setEditingPlayer(null)}
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
            editPlayerForm.handleSubmit();
          }}
          className="flex flex-col gap-y-4"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Main Details */}
            <div className="flex flex-col gap-y-4 md:col-span-2">
              <editPlayerForm.Field name="name">
                {(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Player Name *
                    </Label>
                    <Input
                      id={`edit-${field.name}`}
                      placeholder="e.g. Virat Kohli"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                      required
                    />
                  </div>
                )}
              </editPlayerForm.Field>

              <editPlayerForm.Field name="skills">
                {(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Primary Skills *
                    </Label>
                    <Input
                      id={`edit-${field.name}`}
                      placeholder="e.g. Right-hand Batsman, Medium Pacer"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                      required
                    />
                  </div>
                )}
              </editPlayerForm.Field>

              <editPlayerForm.Field name="categoryId">
                {(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Auction Category Deck *
                    </Label>
                    <select
                      id={`edit-${field.name}`}
                      value={field.state.value || categories[0]?.id || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5 text-xs text-white outline-none focus:border-white"
                      required
                    >
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} (Base: {cat.basePoints} pts)
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </editPlayerForm.Field>
            </div>

            {/* Media Sidebar */}
            <div className="flex flex-col gap-y-4 md:col-span-1">
              <editPlayerForm.Field name="imageUrl">
                {(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Player Photo (Auto-converts to WebP)
                    </Label>
                    <ImageUpload
                      id={`edit-${field.name}`}
                      value={field.state.value}
                      onChange={(url) => field.handleChange(url)}
                      className="mt-2"
                    />
                  </div>
                )}
              </editPlayerForm.Field>
            </div>
          </div>

          <div className="flex gap-x-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setEditingPlayer(null)}
              className="flex-1 cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
            >
              Cancel
            </Button>
            <editPlayerForm.Subscribe
              selector={(state: any) => state.isSubmitting}
              children={(isSubmitting: boolean) => (
                <Button
                  type="submit"
                  disabled={isSubmitting || updatePlayerMutation.isPending}
                  className="flex-1 cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
                >
                  {isSubmitting || updatePlayerMutation.isPending ? "Saving…" : "Save Changes"}
                </Button>
              )}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
