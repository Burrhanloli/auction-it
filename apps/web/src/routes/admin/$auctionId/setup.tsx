import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SettingsIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
  CoinsIcon,
  TrophyIcon,
  ShieldAlertIcon,
  TagIcon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageViewer } from "#/components/image-viewer";
import { $getAuction, $updateAuction } from "#/lib/auction-actions";
import { slugify } from "#/lib/slug";

export const Route = createFileRoute("/admin/$auctionId/setup")({
  component: SetupConsolePage,
});

interface FormCategory {
  id?: string;
  name: string;
  basePoints: number;
}

function SetupConsolePage() {
  const { auctionId } = Route.useParams();

  // Queries
  const { data: auction, isLoading } = useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => $getAuction({ data: auctionId }),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#bbbbbb]">
        <Loader2Icon className="mb-4 h-8 w-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">Syncing Setup Data...</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#bbbbbb]">
        <ShieldAlertIcon className="mb-4 h-8 w-8 text-white" />
        <span className="text-sm font-bold tracking-[1.5px] uppercase">
          Failed to load setup configuration.
        </span>
      </div>
    );
  }

  return <SetupForm auction={auction} auctionId={auctionId} />;
}

interface SetupFormProps {
  auction: any;
  auctionId: string;
}

function SetupForm({ auction, auctionId }: SetupFormProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const fullSlug = auction.slug || "";
  let slugPrefix = fullSlug;
  let slugSuffix = "";
  const parts = fullSlug.split("-");
  if (parts.length > 1) {
    slugSuffix = parts[parts.length - 1];
    slugPrefix = parts.slice(0, -1).join("-");
  }

  const form = useForm({
    defaultValues: {
      name: auction.name,
      logoUrl: auction.logoUrl || "",
      slug: slugPrefix,
      suffix: slugSuffix,
      budgetPerTeam: auction.budgetPerTeam,
      categories: (auction.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        basePoints: c.basePoints,
      })) as FormCategory[],
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Auction Tournament Name is required");
        return;
      }

      if (!value.slug.trim()) {
        toast.error("Auction Slug Prefix is required");
        return;
      }

      if (value.budgetPerTeam <= 0) {
        toast.error("Default budget must be greater than zero");
        return;
      }

      // Validate categories
      if (value.categories.length === 0) {
        toast.error("At least one player category is required");
        return;
      }

      for (let i = 0; i < value.categories.length; i++) {
        const cat = value.categories[i];
        if (!cat.name.trim()) {
          toast.error(`Category #${i + 1} Name cannot be empty`);
          return;
        }
        if (cat.basePoints <= 0) {
          toast.error(`Category "${cat.name}" base price must be positive`);
          return;
        }
      }

      updateAuctionMutation.mutate({
        auctionId,
        slug: value.slug.trim(),
        name: value.name.trim(),
        logoUrl: value.logoUrl ? value.logoUrl.trim() : null,
        budgetPerTeam: value.budgetPerTeam,
        categories: value.categories.map((c) => ({
          id: c.id,
          name: c.name.trim(),
          basePoints: Number(c.basePoints),
        })),
      });
    },
  });

  // Mutation
  const updateAuctionMutation = useMutation({
    mutationFn: (vars: any) => $updateAuction({ data: vars }),
    onSuccess: (res: any) => {
      toast.success("Auction settings saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      if (res.slug && res.slug !== auctionId) {
        navigate({ to: `/admin/${res.slug}/setup` });
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    },
  });

  const handleRemoveCategory = (field: any, index: number, id?: string) => {
    // Check if players are already assigned to this category
    if (id && auction?.players) {
      const playersInCat = auction.players.filter((p: any) => p.categoryId === id);
      if (playersInCat.length > 0) {
        toast.error(
          `Cannot delete! There are ${playersInCat.length} players registered in this category. Reassign or delete them first.`,
        );
        return;
      }
    }

    field.removeValue(index);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mx-auto max-w-6xl space-y-8"
    >
      {/* Basic Settings Card */}
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <div className="mb-8 flex items-center space-x-3 border-b border-[#3c3c3c] pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
            <TrophyIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
              Event Configuration
            </h3>
            <p className="mt-0.5 text-xs text-[#bbbbbb]">Core settings for name and team budgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                  Auction Tournament Name *
                </Label>
                <Input
                  id={field.name}
                  placeholder="e.g. Premier League Season 4"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                  required
                />
              </div>
            )}
          />

          <form.Field
            name="logoUrl"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                  Auction Logo URL (Optional)
                </Label>
                <div className="flex items-center gap-3">
                  {field.state.value && (
                    <ImageViewer
                      src={field.state.value}
                      alt="Logo preview"
                      className="h-12 w-12 rounded-none border border-[#3c3c3c] bg-black object-cover"
                    />
                  )}
                  <Input
                    id={field.name}
                    placeholder="https://example.com/logo.png"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="flex-1 rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                  />
                </div>
              </div>
            )}
          />

          <form.Field
            name="budgetPerTeam"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                  Default Points Budget Per Team *
                </Label>
                <div className="relative">
                  <CoinsIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                  <Input
                    id={field.name}
                    type="number"
                    placeholder="1000"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(Number(e.target.value))}
                    className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                    required
                  />
                </div>
              </div>
            )}
          />

          <form.Field
            name="slug"
            children={(field) => (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                  Auction URL Slug Prefix * (suffix is read-only)
                </Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id={field.name}
                    placeholder="e.g. premier-league"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(slugify(e.target.value))}
                    className="flex-1 rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                    required
                  />
                  <form.Subscribe
                    selector={(state) => state.values.suffix}
                    children={(suffixValue) => (
                      <span className="rounded-none border border-[#3c3c3c] bg-black px-3 py-2 font-mono text-xs text-[#bbbbbb] select-none">
                        -{suffixValue || "xxxxx"}
                      </span>
                    )}
                  />
                </div>
              </div>
            )}
          />
        </div>
      </div>

      {/* Category Decks Card */}
      <form.Field name="categories" mode="array">
        {(field) => (
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-8 flex items-center justify-between border-b border-[#3c3c3c] pb-5">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#3c3c3c] bg-black text-white">
                  <TagIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                    Category Roster Decks
                  </h3>
                  <p className="mt-0.5 text-xs text-[#bbbbbb]">
                    Group players into bid buckets with individual base price tags
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => field.pushValue({ name: "", basePoints: 100 })}
                className="flex cursor-pointer items-center space-x-1.5 rounded-none border border-[#3c3c3c] bg-black px-3 py-1.5 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
              >
                <PlusIcon className="h-3.5 w-3.5 text-[currentcolor]" />
                <span>Add Category</span>
              </Button>
            </div>

            {/* Dynamic categories inputs table */}
            <div className="space-y-4">
              {field.state.value.map((cat, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-4 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4"
                >
                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Category Name
                      </Label>
                      <form.Field name={`categories[${idx}].name`}>
                        {(subField) => (
                          <Input
                            placeholder="e.g. Elite Players, Batsmen, All-rounders"
                            value={subField.state.value}
                            onChange={(e) => subField.handleChange(e.target.value)}
                            className="rounded-none border border-[#3c3c3c] bg-black text-xs text-white"
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Base points value
                      </Label>
                      <div className="relative">
                        <CoinsIcon className="absolute top-2.5 left-3 h-4 w-4 text-[#bbbbbb]" />
                        <form.Field name={`categories[${idx}].basePoints`}>
                          {(subField) => (
                            <Input
                              type="number"
                              placeholder="100"
                              value={subField.state.value}
                              onChange={(e) => subField.handleChange(Number(e.target.value))}
                              className="rounded-none border border-[#3c3c3c] bg-black pl-9 text-xs text-white"
                            />
                          )}
                        </form.Field>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(field, idx, cat.id)}
                    className="mb-1 flex h-9 w-9 cursor-pointer items-center justify-center self-end rounded-none border border-[#3c3c3c] bg-black text-[#bbbbbb] hover:bg-white hover:text-black"
                    title="Remove Category"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {field.state.value.length === 0 && (
                <div className="flex flex-col items-center justify-center space-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-black py-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
                    ⚠️
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-[1.5px] text-white uppercase">
                      No Category Decks Created
                    </h4>
                    <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-[#bbbbbb]">
                      You must configure at least one category to assign players and trigger active
                      bids.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </form.Field>

      {/* Save Settings Block */}
      <div className="flex items-center justify-between rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <div className="flex items-center space-x-2">
          <ShieldAlertIcon className="h-4 w-4 text-white" />
          <span className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
            Review changes carefully. Categories with active roster assignments cannot be removed.
          </span>
        </div>

        <form.Subscribe
          selector={(state) => state.isSubmitting}
          children={(isSubmitting) => (
            <Button
              type="submit"
              disabled={isSubmitting || updateAuctionMutation.isPending}
              className="flex cursor-pointer items-center space-x-2 rounded-none border border-white bg-white px-8 py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-black hover:text-white"
            >
              <SaveIcon className="h-4 w-4" />
              <span>
                {isSubmitting || updateAuctionMutation.isPending
                  ? "Saving..."
                  : "Save Configuration"}
              </span>
            </Button>
          )}
        />
      </div>
    </form>
  );
}
