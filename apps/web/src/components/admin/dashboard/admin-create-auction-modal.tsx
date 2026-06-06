import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { MStripeDivider } from "@repo/ui/components/m-stripe-divider";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Loader2Icon, SparklesIcon, CoinsIcon } from "lucide-react";
import { toast } from "sonner";

import { ImageUpload } from "#/components/image-upload";
import { $createAuction } from "#/lib/auction-actions";

const generateId = () => `new-${crypto.randomUUID()}`;

export function AdminCreateAuctionModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createAuctionMutation = useMutation({
    mutationFn: (vars: {
      name: string;
      budgetPerTeam: number;
      minPlayersPerSquad?: number | null;
      maxPlayersPerSquad?: number | null;
      logoUrl: string | null;
      categories: Array<{
        name: string;
        basePoints: number;
        minPlayersPerCategory?: number | null;
        maxPlayersPerCategory?: number | null;
      }>;
    }) => $createAuction({ data: vars }),
    onSuccess: (res: any) => {
      toast.success("Auction created successfully!");
      queryClient.invalidateQueries({ queryKey: ["my-auctions"] });
      onClose();
      form.reset();
      // eslint-disable-next-line @tanstack/router/no-navigate-in-render
      navigate({ to: `/admin/${res.auctionId}/setup` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create auction");
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      logoUrl: "",
      budgetPerTeam: 1000,
      categories: [
        {
          id: "default-elite",
          name: "Elite",
          basePoints: 500,
          minPlayersPerCategory: null,
          maxPlayersPerCategory: null,
        },
        {
          id: "default-pro",
          name: "Pro",
          basePoints: 300,
          minPlayersPerCategory: null,
          maxPlayersPerCategory: null,
        },
        {
          id: "default-batsmen",
          name: "Batsmen",
          basePoints: 200,
          minPlayersPerCategory: null,
          maxPlayersPerCategory: null,
        },
      ] as Array<{
        id?: string;
        name: string;
        basePoints: number;
        minPlayersPerCategory?: number | null;
        maxPlayersPerCategory?: number | null;
      }>,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <SparklesIcon className="mr-4 size-6 text-white" />
              <div className="inline-flex flex-col">
                <MStripeDivider className="mb-2 w-full" />
                <h2 className="text-2xl font-black text-white uppercase">New Auction</h2>
              </div>
            </div>
            <p className="mt-1 text-sm text-[#bbbbbb]">
              Configure your auction event before going live
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="cursor-pointer rounded-none border border-[#3c3c3c] bg-neutral-950 p-2 text-[#bbbbbb] hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
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
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
                      Auction Name
                    </Label>
                    <Input
                      id={field.name}
                      placeholder="e.g. Premier League Cricket 2026"
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="rounded-none border-[#3c3c3c] bg-neutral-950 py-3 text-sm text-white placeholder-[#7e7e7e] focus:border-white"
                      required
                    />
                  </div>
                )}
              />

              <form.Field
                name="budgetPerTeam"
                children={(field) => (
                  <div className="space-y-1.5">
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
                      Starting Budget Points per Team
                    </Label>
                    <div className="relative">
                      <CoinsIcon className="absolute top-3 left-3 size-4 text-[#bbbbbb]" />
                      <Input
                        id={field.name}
                        type="number"
                        placeholder="1000"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(Number(e.target.value))}
                        className="rounded-none border-[#3c3c3c] bg-neutral-950 py-3 pl-9 text-sm text-white"
                        required
                      />
                    </div>
                  </div>
                )}
              />

              <form.Field
                name="categories"
                mode="array"
                children={(field) => (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-white">
                        Categories & Base Points
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
                        className="rounded-none border border-[#3c3c3c] bg-neutral-950 text-xs tracking-[1.5px] text-white uppercase hover:bg-white hover:text-black"
                      >
                        + Add Category
                      </Button>
                    </div>

                    <div className="max-h-[220px] gap-y-4 overflow-y-auto pr-1">
                      {field.state.value.map((cat, idx) => (
                        <div
                          key={cat.id || idx}
                          className="flex items-center gap-x-3 rounded-none border border-[#3c3c3c] bg-neutral-950 p-3"
                        >
                          <div className="flex-1">
                            <form.Field
                              name={`categories[${idx}].name`}
                              children={(subField) => (
                                <Input
                                  placeholder="Category Name (e.g. Elite)"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(e.target.value)}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-sm text-white"
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
                                  placeholder="Base pts"
                                  value={subField.state.value}
                                  onChange={(e) => subField.handleChange(Number(e.target.value))}
                                  className="rounded-none border-[#3c3c3c] bg-[#1a1a1a] text-sm text-white"
                                  required
                                />
                              )}
                            />
                          </div>
                          {field.state.value.length > 1 && (
                            <button
                              type="button"
                              onClick={() => field.removeValue(idx)}
                              className="cursor-pointer px-2 text-red-400 hover:text-red-300"
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
                    <Label htmlFor={field.name} className="text-sm font-medium text-white">
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
              className="w-full cursor-pointer rounded-none border border-white bg-white py-3 font-bold tracking-[1.5px] text-black uppercase hover:bg-neutral-950 hover:text-white"
            >
              {createAuctionMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2Icon className="size-4 animate-spin" /> Creating…
                </span>
              ) : (
                "Create Auction & Configure"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
