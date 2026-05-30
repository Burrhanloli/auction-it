import { authClient } from "@repo/auth/auth-client";
import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "#/components/logo";

export const Route = createFileRoute("/_guest/signup")({
  component: SignupForm,
});

function SignupForm() {
  const { redirectUrl } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: signupMutate, isPending } = useMutation({
    mutationFn: async (data: { name: string; username: string; password: string }) => {
      await authClient.signUp.email(
        {
          name: data.name,
          username: data.username,
          password: data.password,
          email: `${data.username}@auction-it.local`,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occurred while signing up.");
          },
          onSuccess: () => {
            queryClient.removeQueries({ queryKey: authQueryOptions().queryKey });
            navigate({ to: redirectUrl });
          },
        },
      );
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!name || !username || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    signupMutate({ name, username, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link to="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
                <Logo className="h-6 w-6" />
              </div>
            </Link>
            <div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
              <h1 className="mt-2 text-xs font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Create Administrative Account
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label
                htmlFor="name"
                className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
              >
                Name
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                readOnly={isPending}
                className="h-12 rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="username"
                className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
              >
                Username
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                readOnly={isPending}
                className="h-12 rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="password"
                className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
              >
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                readOnly={isPending}
                className="h-12 rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label
                htmlFor="confirm_password"
                className="text-xs font-bold tracking-[1.5px] text-[#bbbbbb] uppercase"
              >
                Confirm Password
              </Label>
              <Input
                id="confirm_password"
                name="confirm_password"
                type="password"
                placeholder="Confirm Password"
                readOnly={isPending}
                className="h-12 rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                required
              />
            </div>
            <Button
              type="submit"
              className="mt-4 h-12 w-full rounded-none border border-white bg-white font-bold tracking-[1.5px] text-black uppercase transition-colors hover:bg-black hover:text-white"
              disabled={isPending}
            >
              {isPending && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Signing up..." : "Sign up"}
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm text-[#bbbbbb]">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-bold tracking-[1.5px] text-white uppercase hover:underline"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
