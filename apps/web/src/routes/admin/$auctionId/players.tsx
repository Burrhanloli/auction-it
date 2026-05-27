import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlusIcon, SearchIcon, Loader2Icon, PlusIcon, PencilIcon, XIcon } from "lucide-react";
import Papa from "papaparse";
import { useState } from "react";
import { toast } from "sonner";

import {
  $getAuction,
  $addPlayer,
  $addPlayersBulk,
  $updatePlayer,
  $deletePlayer,
} from "#/lib/auction-actions";

export const Route = createFileRoute("/admin/$auctionId/players")({
  component: PlayerDirectoryPage,
});

function PlayerDirectoryPage() {
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-8 w-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">
          Syncing Roster Registry...
        </span>
      </div>
    );
  }

  const players = auction?.players ?? [];
  const categories = auction?.categories ?? [];

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedPlayers = results.data
          .map((row: any) => {
            const categoryName = row["Category Name"] || row.categoryName || row.category;
            const matchedCategory = categories.find(
              (c: any) => c.name.toLowerCase() === (categoryName || "").toLowerCase(),
            );

            return {
              name: row["Player Name"] || row.name,
              skills: row["Skills"] || row.skills,
              categoryId: matchedCategory?.id || categories[0]?.id,
              imageUrl: row["Image URL"] || row.imageUrl || null,
            };
          })
          .filter((p: any) => p.name && p.skills && p.categoryId);

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
      <div className="block w-full lg:hidden">
        <Button
          onClick={() => setShowMobileForm(!showMobileForm)}
          className="flex w-full items-center justify-center space-x-2 rounded-none border border-white bg-white px-4 py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
        >
          <UserPlusIcon className="h-4 w-4" />
          <span>{showMobileForm ? "Close Registration Form" : "Register Roster Player"}</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
        {/* Left Column: Register Player Form & Stats */}
        <div
          className={`lg:block ${showMobileForm ? "block" : "hidden"} w-full space-y-6 lg:col-span-1`}
        >
          {/* Statistics Grid */}
          <div className="grid w-full grid-cols-3 gap-3 sm:gap-4">
            <div className="rounded-none border border-[#3c3c3c] bg-black p-3 text-center sm:p-4">
              <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Total Roster
              </span>
              <span className="mt-1 block text-lg font-black text-white sm:text-xl">
                {totalCount}
              </span>
            </div>
            <div className="rounded-none border border-[#3c3c3c] bg-black p-3 text-center sm:p-4">
              <span className="block text-[8px] font-bold tracking-[1.5px] text-white uppercase">
                Sold squad
              </span>
              <span className="mt-1 block text-lg font-black text-white sm:text-xl">
                {soldCount}
              </span>
            </div>
            <div className="rounded-none border border-[#3c3c3c] bg-black p-3 text-center sm:p-4">
              <span className="block text-[8px] font-bold tracking-[1.5px] text-white uppercase">
                Unsold Left
              </span>
              <span className="mt-1 block text-lg font-black text-white sm:text-xl">
                {unsoldCount}
              </span>
            </div>
          </div>

          {/* Add Player Form Card */}
          <div className="relative w-full overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 sm:p-8">
            <h3 className="mb-6 flex items-center text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
              <UserPlusIcon className="mr-2 h-5 w-5 text-white" />
              Register Roster Player
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addPlayerForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <addPlayerForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Player Name *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Virat Kohli"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <addPlayerForm.Field
                name="skills"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Primary Skills *
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Right-hand Batsman, Medium Pacer"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <addPlayerForm.Field
                name="categoryId"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Auction Category Deck *
                    </Label>
                    <select
                      id={field.name}
                      value={field.state.value || categories[0]?.id || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-none border border-[#3c3c3c] bg-black p-2.5 text-xs text-white outline-none focus:border-white"
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
              />

              <addPlayerForm.Field
                name="imageUrl"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Player Photo Image URL
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="https://example.com/photo.png"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    />
                  </div>
                )}
              />

              <addPlayerForm.Subscribe
                selector={(state) => state.isSubmitting}
                children={(isSubmitting) => (
                  <Button
                    type="submit"
                    disabled={
                      isSubmitting || addPlayerMutation.isPending || categories.length === 0
                    }
                    className="mt-4 w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white disabled:border-[#3c3c3c] disabled:bg-[#1a1a1a] disabled:text-[#7e7e7e] disabled:hover:bg-[#1a1a1a] disabled:hover:text-[#7e7e7e]"
                  >
                    {isSubmitting || addPlayerMutation.isPending
                      ? "Adding Player..."
                      : "Add Player to Roster"}
                  </Button>
                )}
              />
            </form>
          </div>

          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6 sm:p-8">
            <h3 className="mb-6 flex items-center text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
              <PlusIcon className="mr-2 h-5 w-5 text-white" />
              Bulk Upload Players
            </h3>
            <div className="space-y-4">
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
                  className="cursor-pointer rounded-none border border-[#3c3c3c] bg-black text-xs text-white file:mr-4 file:border-0 file:bg-[#3c3c3c] file:px-4 file:py-1 file:text-xs file:text-white file:uppercase hover:file:bg-white hover:file:text-black"
                />
              </div>
              <button
                onClick={downloadSampleCsv}
                disabled={categories.length === 0}
                className="text-[10px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase underline hover:text-white disabled:opacity-50"
              >
                Download Sample CSV
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Interactive Search & Directory */}
        <div className="w-full space-y-6 lg:col-span-2">
          <div className="flex w-full flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4 sm:p-6 md:p-8">
            {/* Header & Filter Controls */}
            <div className="mb-6 w-full space-y-4 border-b border-[#3c3c3c] pb-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-bold tracking-[1.5px] text-white uppercase sm:text-base">
                    Roster Registry
                  </h3>
                  <p className="mt-1 text-[10px] text-[#bbbbbb]">
                    Search, filter, and track player draft allocations
                  </p>
                </div>

                {/* Status Pills */}
                <div className="flex w-auto self-start rounded-none border border-[#3c3c3c] bg-black p-1">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`cursor-pointer rounded-none px-3 py-1 text-[9px] font-black tracking-[1.5px] uppercase transition-colors ${
                      statusFilter === "all"
                        ? "bg-white text-black"
                        : "text-[#bbbbbb] hover:text-white"
                    }`}
                  >
                    All
                  </button>
                  <button
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
                  <SearchIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                  <Input
                    placeholder="Search player name or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                  />
                </div>

                <select
                  value={selectedFilterCategory}
                  onChange={(e) => setSelectedFilterCategory(e.target.value)}
                  className="w-full rounded-none border border-[#3c3c3c] bg-black p-2.5 text-xs text-white outline-none focus:border-white"
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
              {filteredPlayers.map((player: any) => {
                const categoryName = player.category?.name ?? "Player Pool";
                const isElite = categoryName.toLowerCase() === "elite";
                const isPro = categoryName.toLowerCase() === "pro";

                const glowClass = "border-[#3c3c3c] hover:border-white bg-black";
                const ringClass = "border-[#3c3c3c] bg-[#1a1a1a]";
                const badgeColor = isElite
                  ? "border-white text-black bg-white"
                  : isPro
                    ? "border-[#3c3c3c] text-white bg-[#1a1a1a]"
                    : "border-[#3c3c3c] text-[#bbbbbb] bg-black";

                return (
                  <div
                    key={player.id}
                    className={`relative flex flex-col overflow-hidden rounded-none border bg-[#1a1a1a] transition-all duration-300 hover:scale-[1.02] ${glowClass} ${
                      player.status === "sold" || player.status === "captain"
                        ? "opacity-90 hover:border-[#7e7e7e]"
                        : ""
                    }`}
                  >
                    {/* Top Section: Compact Full Bleed Image */}
                    <div className="relative aspect-[3/4] max-h-64 w-full shrink-0 bg-black">
                      {player.imageUrl ? (
                        <img
                          src={player.imageUrl}
                          alt={player.name}
                          className="absolute inset-0 h-full w-full object-contain"
                        />
                      ) : (
                        <div className="absolute inset-0 flex h-full w-full items-center justify-center bg-black text-[48px] font-bold tracking-tight text-white uppercase">
                          {player.name.slice(0, 2)}
                        </div>
                      )}

                      {/* Overlay badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        <span
                          className={`inline-flex w-fit items-center rounded-none border px-2 py-0.5 text-[10px] font-bold tracking-[1px] uppercase shadow-lg ${badgeColor}`}
                        >
                          {categoryName}
                        </span>
                        {player.status === "sold" ? (
                          <span className="inline-flex w-fit items-center rounded-none border border-white bg-white px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-black uppercase shadow-lg">
                            SOLD TO {player.soldToTeam?.name}
                          </span>
                        ) : player.status === "captain" ? (
                          <span className="inline-flex w-fit items-center rounded-none border border-white bg-white px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-black uppercase shadow-lg">
                            CAPTAIN: {player.soldToTeam?.name}
                          </span>
                        ) : player.status === "bidding" ? (
                          <span className="inline-flex w-fit animate-pulse items-center rounded-none border border-[#3c3c3c] bg-black px-2 py-0.5 text-[10px] font-bold tracking-[1px] text-white uppercase shadow-lg">
                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
                            ACTIVE BID
                          </span>
                        ) : null}
                      </div>

                      {/* Wishlists */}
                      {player.wishlists?.length > 0 && (
                        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
                          {player.wishlists.map((w: any) => (
                            <div
                              key={w.id}
                              className="flex items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black/80 px-2 py-0.5 shadow-lg backdrop-blur-sm"
                              title={`Wishlisted by ${w.team?.name}`}
                            >
                              <span className="text-[10px] font-black tracking-[1px] text-yellow-400 uppercase">
                                ⭐
                              </span>
                              {w.team?.logoUrl ? (
                                <img
                                  src={w.team.logoUrl}
                                  alt={w.team.name}
                                  className="h-4 w-4 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-[10px] font-bold text-white uppercase">
                                  {w.team?.name?.slice(0, 2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* M-Stripe Divider */}
                      <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-[#0066b1] via-[#1c69d4] to-[#e22718]" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-4">
                        <h4
                          className="line-clamp-2 text-[24px] leading-[1.1] font-bold text-white uppercase"
                          title={player.name}
                        >
                          {player.name}
                        </h4>
                      </div>

                      <div className="mt-auto flex flex-col gap-2">
                        {auction?.status === "draft" && (
                          <div className="flex gap-2 border-t border-[#3c3c3c] pt-2">
                            <button
                              onClick={() => {
                                setEditingPlayer(player);
                                editPlayerForm.setFieldValue("name", player.name);
                                editPlayerForm.setFieldValue("skills", player.skills);
                                editPlayerForm.setFieldValue("categoryId", player.categoryId);
                                editPlayerForm.setFieldValue("imageUrl", player.imageUrl || "");
                              }}
                              className="flex h-[28px] flex-1 items-center justify-center border border-white bg-transparent text-[10px] font-bold tracking-[1px] text-white uppercase transition-colors hover:bg-white hover:text-black"
                              title="Edit Details"
                            >
                              Edit Player
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  window.confirm("Are you sure you want to delete this player?")
                                ) {
                                  deletePlayerMutation.mutate({ playerId: player.id });
                                }
                              }}
                              disabled={deletePlayerMutation.isPending}
                              className="flex h-[28px] flex-1 items-center justify-center border border-[#e22718] bg-transparent text-[10px] font-bold tracking-[1px] text-[#e22718] uppercase transition-colors hover:bg-[#e22718] hover:text-white disabled:opacity-50"
                              title="Delete Player"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                        {/* Skills */}
                        <div className="flex items-start justify-between border-t border-[#3c3c3c] pt-2">
                          <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                            Skills
                          </span>
                          <span className="line-clamp-1 text-right text-[12px] font-light text-[#bbbbbb] uppercase">
                            {player.skills}
                          </span>
                        </div>

                        {/* Value Details */}
                        <div className="flex items-center justify-between border-t border-[#3c3c3c] pt-2">
                          <span className="text-[12px] font-bold tracking-[1.5px] text-[#7e7e7e] uppercase">
                            {player.status === "sold" || player.status === "captain"
                              ? "Acquired Value"
                              : "Base Value"}
                          </span>
                          <span className="text-[14px] font-bold tracking-[1px] text-white uppercase">
                            {player.status === "sold" || player.status === "captain"
                              ? `${player.soldPoints} pts`
                              : `${player.category?.basePoints} pts`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPlayers.length === 0 && (
                <div className="col-span-1 flex flex-col items-center justify-center space-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-black py-16 text-center md:col-span-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                    👤
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                      No Matching Roster Entries
                    </h4>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                      Try adjusting your search queries or register a new player deck in the setup
                      form.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Player Dialog Overlay */}
      {editingPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="flex items-center text-xl font-bold tracking-[1.5px] text-white uppercase">
                <PencilIcon className="mr-2 h-5 w-5 text-white" />
                Edit Player: {editingPlayer.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPlayer(null)}
                className="cursor-pointer text-[#bbbbbb] hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                editPlayerForm.handleSubmit();
              }}
              className="space-y-4"
            >
              <editPlayerForm.Field
                name="name"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Player Name *
                    </Label>
                    <Input
                      id={`edit-${field.name}`}
                      placeholder="e.g. Virat Kohli"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <editPlayerForm.Field
                name="skills"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Primary Skills *
                    </Label>
                    <Input
                      id={`edit-${field.name}`}
                      placeholder="e.g. Right-hand Batsman, Medium Pacer"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                      required
                    />
                  </div>
                )}
              />

              <editPlayerForm.Field
                name="categoryId"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Auction Category Deck *
                    </Label>
                    <select
                      id={`edit-${field.name}`}
                      value={field.state.value || categories[0]?.id || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="w-full rounded-none border border-[#3c3c3c] bg-black p-2.5 text-xs text-white outline-none focus:border-white"
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
              />

              <editPlayerForm.Field
                name="imageUrl"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={`edit-${field.name}`} className="text-xs text-[#bbbbbb]">
                      Player Photo Image URL
                    </Label>
                    <Input
                      id={`edit-${field.name}`}
                      placeholder="https://example.com/photo.png"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    />
                  </div>
                )}
              />

              <div className="flex space-x-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingPlayer(null)}
                  className="flex-1 cursor-pointer rounded-none border border-[#3c3c3c] bg-black py-3 font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
                >
                  Cancel
                </Button>
                <editPlayerForm.Subscribe
                  selector={(state) => state.isSubmitting}
                  children={(isSubmitting) => (
                    <Button
                      type="submit"
                      disabled={isSubmitting || updatePlayerMutation.isPending}
                      className="flex-1 cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
                    >
                      {isSubmitting || updatePlayerMutation.isPending
                        ? "Saving..."
                        : "Save Changes"}
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
