import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  SettingsIcon,
  SaveIcon,
  PlusIcon,
  TrashIcon,
  CoinsIcon,
  ShieldAlertIcon,
  TagIcon,
  Loader2Icon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "#/components/image-upload";
import { ImageViewer } from "#/components/image-viewer";
import { Logo } from "#/components/logo";
import { $getAuction, $updateAuction } from "#/lib/auction-actions";
import { slugify } from "#/lib/slug";

const generateId = () => `new-${crypto.randomUUID()}`;

export const Route = createFileRoute("/admin/$auctionId/setup")({
  component: SetupConsolePage,
});

interface FormCategory {
  id?: string;
  name: string;
  basePoints: number;
  minPlayersPerCategory?: number | null | "";
  maxPlayersPerCategory?: number | null | "";
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
        <Loader2Icon className="mb-4 size-8 animate-spin text-white" />
        <span className="text-xs font-bold tracking-[1.5px] uppercase">Syncing Setup Data…</span>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-[#bbbbbb]">
        <ShieldAlertIcon className="mb-4 size-8 text-white" />
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

export function SetupForm({ auction, auctionId }: SetupFormProps) {
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
      minPlayersPerSquad: auction.minPlayersPerSquad ?? "",
      maxPlayersPerSquad: auction.maxPlayersPerSquad ?? "",
      categories: (auction.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        basePoints: c.basePoints,
        minPlayersPerCategory: c.minPlayersPerCategory ?? "",
        maxPlayersPerCategory: c.maxPlayersPerCategory ?? "",
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
        minPlayersPerSquad: value.minPlayersPerSquad ? Number(value.minPlayersPerSquad) : null,
        maxPlayersPerSquad: value.maxPlayersPerSquad ? Number(value.maxPlayersPerSquad) : null,
        categories: value.categories.map((c: any) => ({
          id: c.id,
          name: c.name.trim(),
          basePoints: Number(c.basePoints),
          minPlayersPerCategory: c.minPlayersPerCategory ? Number(c.minPlayersPerCategory) : null,
          maxPlayersPerCategory: c.maxPlayersPerCategory ? Number(c.maxPlayersPerCategory) : null,
        })),
      });
    },
  });

  // Mutation
  const updateAuctionMutation = useMutation({
    mutationFn: (vars: any) => $updateAuction({ data: vars }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      toast.success("Auction settings saved successfully!");
      if (res.slug && res.slug !== auctionId) {
        // react-doctor-disable-next-line react-doctor/tanstack-start-no-navigate-in-render
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
    // react-doctor-disable-next-line react-doctor/no-prevent-default
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="mx-auto flex max-w-6xl flex-col gap-y-4"
    >
      <fieldset disabled={auction.status === "completed"} className="flex flex-col gap-y-4">
        <BasicSettingsCard form={form} auction={auction} />
        <CategoryDecksCard
          form={form}
          handleRemoveCategory={handleRemoveCategory}
          auction={auction}
        />
      </fieldset>
      {/* Save Settings Block */}
      {auction?.status !== "completed" && (
        <div className="flex flex-col items-start justify-between gap-6 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8 md:flex-row md:items-center md:gap-0">
          <div className="flex items-center gap-x-2">
            <ShieldAlertIcon className="size-4 text-white" />
            <span className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
              Review changes carefully. Categories with active roster assignments cannot be removed.
            </span>
          </div>

          <form.Subscribe
            selector={(state: any) => state.isSubmitting}
            children={(isSubmitting) => (
              <Button
                type="submit"
                disabled={isSubmitting || updateAuctionMutation.isPending}
                className="flex cursor-pointer items-center gap-x-2 rounded-none border border-white bg-white px-8 py-3 font-black tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
              >
                <SaveIcon className="size-4" />
                <span>
                  {isSubmitting || updateAuctionMutation.isPending
                    ? "Saving…"
                    : "Save Configuration"}
                </span>
              </Button>
            )}
          />
        </div>
      )}
    </form>
  );
}

export function BasicSettingsCard({ form, auction }: { form: any; auction: any }) {
  return (
    <>
      {/* Basic Settings Card */}
      <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <div className="mb-8 flex items-center gap-x-3 border-b border-[#3c3c3c] pb-5">
          <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
            <Logo src={auction.logoUrl} className="size-[18px]" />
          </div>
          <div>
            <div className="inline-flex flex-col">
              <MStripeDivider className="mb-1 w-full" />
              <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                Event Configuration
              </h3>
            </div>
            <p className="mt-0.5 text-xs text-[#bbbbbb]">Core settings for name and team budgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Main Details */}
          <div className="flex flex-col gap-y-8 md:col-span-2">
            <form.Field
              name="name"
              children={(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Auction Tournament Name *
                  </Label>
                  <Input
                    id={field.name}
                    placeholder="e.g. Premier League Season 4"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    required
                  />
                </div>
              )}
            />

            <form.Field
              name="budgetPerTeam"
              children={(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Default Points Budget Per Team *
                  </Label>
                  <div className="relative">
                    <CoinsIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="1000"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
                      required
                    />
                  </div>
                </div>
              )}
            />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <form.Field
                name="minPlayersPerSquad"
                children={(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Min Players Per Squad (Optional)
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="e.g. 15"
                      value={field.state.value as any}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    />
                  </div>
                )}
              />

              <form.Field
                name="maxPlayersPerSquad"
                children={(field: any) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                      Max Players Per Squad (Optional)
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="e.g. 25"
                      value={field.state.value as any}
                      onChange={(e) => field.handleChange(e.target.value as any)}
                      className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                    />
                  </div>
                )}
              />
            </div>

            <form.Field
              name="slug"
              children={(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Auction URL Slug Prefix * (suffix is read-only)
                  </Label>
                  <div className="flex items-center gap-x-2">
                    <Input
                      id={field.name}
                      placeholder="e.g. premier-league"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(slugify(e.target.value))}
                      className="flex-1 rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                      required
                    />
                    <form.Subscribe
                      selector={(state: any) => state.values.suffix}
                      children={(suffixValue: any) => (
                        <span className="rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-2 font-mono text-xs text-[#bbbbbb] select-none">
                          -{suffixValue || "yyyyy"}
                        </span>
                      )}
                    />
                  </div>
                </div>
              )}
            />
          </div>

          {/* Media Sidebar */}
          <div className="flex flex-col gap-y-8 md:col-span-1">
            <form.Field
              name="logoUrl"
              children={(field: any) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs text-[#bbbbbb]">
                    Auction Logo (Auto-converts to WebP)
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
      </div>
    </>
  );
}

export function CategoryDecksCard({
  form,
  handleRemoveCategory,
  auction,
}: {
  form: any;
  handleRemoveCategory: any;
  auction: any;
}) {
  return (
    <>
      {/* Category Decks Card */}
      <form.Field name="categories" mode="array">
        {(field: any) => (
          <div className="relative overflow-hidden rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
            <div className="mb-8 flex flex-col items-start gap-4 border-b border-[#3c3c3c] pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
              <div className="flex items-center gap-x-3">
                <div className="flex size-9 items-center justify-center rounded-none border border-[#3c3c3c] bg-neutral-950 text-white">
                  <TagIcon className="size-[18px]" />
                </div>
                <div>
                  <div className="inline-flex flex-col">
                    <MStripeDivider className="mb-1 w-full" />
                    <h3 className="text-base font-bold tracking-[1.5px] text-white uppercase">
                      Category Roster Decks
                    </h3>
                  </div>
                  <p className="mt-0.5 text-xs text-[#bbbbbb]">
                    Group players into bid buckets with individual base price tags
                  </p>
                </div>
              </div>

              {auction?.status !== "completed" && (
                <Button
                  type="button"
                  onClick={() => field.pushValue({ id: generateId(), name: "", basePoints: 100 })}
                  className="flex cursor-pointer items-center gap-x-1.5 rounded-none border border-[#3c3c3c] bg-neutral-950 px-3 py-1.5 text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase hover:bg-white hover:text-black"
                >
                  <PlusIcon className="size-3.5 text-[currentcolor]" />
                  <span>Add Category</span>
                </Button>
              )}
            </div>

            {/* Dynamic categories inputs table */}
            <div className="space-y-1.5">
              {field.state.value.map((cat: any, idx: any) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-x-4 rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-4"
                >
                  <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-4">
                    <div className="flex flex-col gap-y-4 md:col-span-2">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Category Name
                      </Label>
                      <form.Field name={`categories[${idx}].name`}>
                        {(subField: any) => (
                          <Input
                            placeholder="e.g. Elite Players, Batsmen, All-rounders"
                            value={subField.state.value}
                            onChange={(e) => subField.handleChange(e.target.value)}
                            className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-y-4 md:col-span-2">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Base points value
                      </Label>
                      <div className="relative">
                        <CoinsIcon className="absolute top-2.5 left-3 size-4 text-[#bbbbbb]" />
                        <form.Field name={`categories[${idx}].basePoints`}>
                          {(subField: any) => (
                            <Input
                              type="number"
                              placeholder="100"
                              value={subField.state.value}
                              onChange={(e) => subField.handleChange(Number(e.target.value))}
                              className="rounded-none border border-[#3c3c3c] bg-neutral-950 pl-9 text-xs text-white"
                            />
                          )}
                        </form.Field>
                      </div>
                    </div>
                    <div className="flex flex-col gap-y-4 md:col-span-2">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Min Players (Opt)
                      </Label>
                      <form.Field name={`categories[${idx}].minPlayersPerCategory`}>
                        {(subField: any) => (
                          <Input
                            type="number"
                            placeholder="e.g. 1"
                            value={subField.state.value as any}
                            onChange={(e) => subField.handleChange(e.target.value as any)}
                            className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                          />
                        )}
                      </form.Field>
                    </div>
                    <div className="flex flex-col gap-y-4 md:col-span-2">
                      <Label className="text-[10px] font-bold tracking-[1.5px] text-[#bbbbbb] uppercase">
                        Max Players (Opt)
                      </Label>
                      <form.Field name={`categories[${idx}].maxPlayersPerCategory`}>
                        {(subField: any) => (
                          <Input
                            type="number"
                            placeholder="e.g. 5"
                            value={subField.state.value as any}
                            onChange={(e) => subField.handleChange(e.target.value as any)}
                            className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs text-white"
                          />
                        )}
                      </form.Field>
                    </div>
                  </div>

                  {auction?.status !== "completed" && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(field, idx, cat.id)}
                      className="mb-1 flex size-9 cursor-pointer items-center justify-center self-end rounded-none border border-[#3c3c3c] bg-neutral-950 text-[#bbbbbb] hover:bg-white hover:text-black"
                      title="Remove Category"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  )}
                </div>
              ))}

              {field.state.value.length === 0 && (
                <div className="flex flex-col items-center justify-center gap-y-4 rounded-none border border-dashed border-[#3c3c3c] bg-neutral-950 py-12 text-center">
                  <div className="flex size-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] text-lg text-white">
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
    </>
  );
}
