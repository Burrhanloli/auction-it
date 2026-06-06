import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  TrophyIcon,
  PlayIcon,
  ShieldAlertIcon,
  PlusIcon,
  UserIcon,
  CompassIcon,
  CalendarIcon,
  ChevronRightIcon,
  DollarSignIcon,
  ActivityIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ImageUpload } from "#/components/image-upload";
import { $getAllAuctions, $createAuction } from "#/lib/auction-actions";

const generateId = () => `new-${crypto.randomUUID()}`;

export function CreateAuctionModal({
  setShowCreateForm,
}: {
  setShowCreateForm: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: {
      name: "",
      logoUrl: "",
      budgetPerTeam: 1000,
      categories: [
        { id: "default-elite", name: "Elite", basePoints: 500 },
        { id: "default-pro", name: "Pro", basePoints: 300 },
        { id: "default-batsmen", name: "Batsmen", basePoints: 200 },
      ] as Array<{ id: string; name: string; basePoints: number }>,
    },
    onSubmit: async ({ value }) => {
      if (!value.name.trim()) {
        toast.error("Auction name is required!");
        return;
      }
      createAuctionMutation.mutate({
        name: value.name.trim(),
        budgetPerTeam: value.budgetPerTeam,
        logoUrl: value.logoUrl ? value.logoUrl.trim() : null,
        categories: value.categories,
      });
    },
  });

  // Mutation to create auction
  const createAuctionMutation = useMutation({
    mutationFn: (vars: {
      name: string;
      budgetPerTeam: number;
      logoUrl: string | null;
      categories: Array<{ name: string; basePoints: number }>;
    }) => $createAuction({ data: vars }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["auctions"] });
      toast.success("Auction created successfully!");
      setShowCreateForm(false);
      form.reset();
      // Navigate straight to the setup of the created auction
      navigate({ to: `/admin/${res.auctionId}/setup` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create auction");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center text-2xl font-bold text-white">
            <PlusIcon className="mr-2 size-6 text-white" />
            Initialize Player Auction
          </h2>
          <Button
            variant="ghost"
            onClick={() => setShowCreateForm(false)}
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
        </div>

        {/* react-doctor-disable-next-line react-doctor/no-prevent-default */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-y-4"
        >
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {/* Main Details */}
            <div className="flex flex-col gap-y-4 md:col-span-2">
              <form.Field
                name="name"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-slate-300">
                      Auction Title
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Premier League Cricket 2026"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border-[#3c3c3c] bg-neutral-950 text-white placeholder-[#7e7e7e] focus:border-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="budgetPerTeam"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-slate-300">
                      Starting Budget Points per Team
                    </Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="1000"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      className="rounded-none border-[#3c3c3c] bg-neutral-950 text-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="categories"
                mode="array"
                children={(field) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="font-semibold text-slate-300">
                        Categories & Custom Base Points
                      </Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          field.pushValue({
                            id: generateId(),
                            name: "",
                            basePoints: 100,
                          })
                        }
                        className="rounded-none border-[#3c3c3c] bg-neutral-950 text-xs tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                      >
                        + Add Category
                      </Button>
                    </div>

                    <div className="max-h-50 gap-y-4 overflow-y-auto pr-1">
                      {field.state.value.map((cat, idx) => (
                        <div
                          key={cat.id}
                          className="flex items-center gap-x-2 rounded-none border border-[#3c3c3c] bg-neutral-950 p-2.5"
                        >
                          <div className="flex-1">
                            <form.Field
                              name={`categories[${idx}].name`}
                              children={(subField) => (
                                <Input
                                  placeholder="Category Name (e.g. Elite, Bowler)"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          <div className="w-32">
                            <form.Field
                              name={`categories[${idx}].basePoints`}
                              children={(subField) => (
                                <Input
                                  type="number"
                                  placeholder="Base points"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(Number(e.target.value))}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-xs text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              onClick={() => field.removeValue(idx)}
                              className="cursor-pointer px-2 text-sm text-red-400 hover:text-red-300"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              />
            </div>

            {/* Media Sidebar */}
            <div className="flex flex-col gap-y-4 md:col-span-1">
              <form.Field
                name="logoUrl"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-slate-300">
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

          <div className="pt-2">
            <Button
              type="submit"
              disabled={createAuctionMutation.isPending}
              className="w-full rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
            >
              {createAuctionMutation.isPending ? "Creating Event…" : "Launch Bidding Arena"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
