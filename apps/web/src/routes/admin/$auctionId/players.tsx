import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserPlusIcon, SearchIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { $getAuction, $addPlayer } from "#/lib/auction-actions";

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
        </div>

        {/* Right Area: Interactive Search & Directory */}
        <div className="w-full space-y-6 lg:col-span-2">
          <div className="flex h-full w-full flex-col rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4 sm:p-6 md:p-8">
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
                    className={`relative flex flex-col justify-between overflow-hidden rounded-none border p-4 transition-all duration-300 hover:scale-[1.02] sm:p-5 ${glowClass} ${
                      player.status === "sold" || player.status === "captain"
                        ? "opacity-90 hover:border-[#7e7e7e]"
                        : ""
                    }`}
                  >
                    {/* Top Row: Category tag (left) & Status badge (right) - No Absolute Overlaps */}
                    <div className="mb-4 flex w-full items-center justify-between gap-2">
                      <span
                        className={`rounded-none border px-2.5 py-0.5 text-[8px] font-black tracking-[1.5px] uppercase ${badgeColor}`}
                      >
                        {categoryName}
                      </span>

                      {player.status === "sold" ? (
                        <span className="inline-flex items-center rounded-none border border-white bg-white px-2.5 py-0.5 text-[7px] font-black tracking-[1.5px] text-black uppercase">
                          SOLD
                        </span>
                      ) : player.status === "captain" ? (
                        <span className="inline-flex items-center rounded-none border border-white bg-white px-2.5 py-0.5 text-[7px] font-black tracking-[1.5px] text-black uppercase">
                          CAPTAIN
                        </span>
                      ) : player.status === "bidding" ? (
                        <span className="inline-flex animate-pulse items-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-2.5 py-0.5 text-[7px] font-black tracking-[1.5px] text-white uppercase">
                          BIDDING
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-none border border-[#3c3c3c] bg-black px-2.5 py-0.5 text-[7px] font-black tracking-[1.5px] text-[#bbbbbb] uppercase">
                          UNSOLD
                        </span>
                      )}
                    </div>

                    {/* Profile Section: Avatar & Info - Mobile responsive centering, desktop layout */}
                    <div className="xs:flex-row xs:items-start xs:text-left flex w-full flex-col items-center gap-4 text-center">
                      {player.imageUrl ? (
                        <div className="relative shrink-0">
                          <img
                            src={player.imageUrl}
                            alt={player.name}
                            className={`h-16 w-16 rounded-none border object-cover ${ringClass} transition-all`}
                          />
                          {(player.status === "sold" || player.status === "captain") && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-none bg-black/60">
                              <span className="rotate-[-12deg] rounded-none border border-white bg-white px-1 py-0.5 text-[7px] font-black tracking-[1.5px] text-black">
                                {player.status === "captain" ? "CAPTAIN" : "SOLD"}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="relative shrink-0">
                          <div
                            className={`flex h-16 w-16 items-center justify-center rounded-none border text-base font-black text-white uppercase ${ringClass}`}
                          >
                            {player.name.slice(0, 2)}
                          </div>
                          {(player.status === "sold" || player.status === "captain") && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-none bg-black/60">
                              <span className="rotate-[-12deg] rounded-none border border-white bg-white px-1 py-0.5 text-[7px] font-black tracking-[1.5px] text-black">
                                {player.status === "captain" ? "CAPTAIN" : "SOLD"}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="w-full min-w-0 flex-1 space-y-1">
                        <h4
                          className="w-full truncate text-sm font-black text-white uppercase sm:text-base"
                          title={player.name}
                        >
                          {player.name}
                        </h4>
                        <p className="xs:justify-start flex flex-wrap items-center justify-center gap-1.5 text-xs text-[#bbbbbb]">
                          <span className="shrink-0 text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                            SKILLS:
                          </span>
                          <span
                            className="block max-w-full truncate font-medium text-[#bbbbbb]"
                            title={player.skills}
                          >
                            {player.skills}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Stats and Bid Price Tag Section */}
                    <div className="mt-5 flex w-full items-center justify-between gap-4 border-t border-[#3c3c3c] pt-4">
                      <div className="min-w-0 flex-1">
                        {player.status === "sold" || player.status === "captain" ? (
                          <div className="text-left">
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              {player.status === "captain" ? "Captain for Team" : "Sold to Team"}
                            </span>
                            <span
                              className="block w-full truncate text-xs font-black text-white uppercase"
                              title={player.soldToTeam?.name}
                            >
                              {player.soldToTeam?.name}
                            </span>
                          </div>
                        ) : player.status === "bidding" ? (
                          <div className="text-left">
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Bidding Stage
                            </span>
                            <span className="flex items-center text-xs font-black text-white uppercase">
                              <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0fa336]" />
                              Active Bid
                            </span>
                          </div>
                        ) : (
                          <div className="text-left">
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Current Status
                            </span>
                            <span className="text-xs font-bold text-white uppercase">
                              Available Draft
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] px-3.5 py-1.5 text-right">
                        {player.status === "sold" || player.status === "captain" ? (
                          <>
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              {player.status === "captain" ? "Role" : "Final Value"}
                            </span>
                            <span className="text-sm font-black text-white">
                              {player.status === "captain"
                                ? "TEAM CAPTAIN"
                                : `${player.soldPoints} pts`}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="block text-[8px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                              Base Value
                            </span>
                            <span className="text-sm font-black text-white">
                              {player.category?.basePoints} pts
                            </span>
                          </>
                        )}
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
    </div>
  );
}
