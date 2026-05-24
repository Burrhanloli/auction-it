import { authClient } from "@repo/auth/auth-client";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TrophyIcon, LoaderCircleIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_guest/login")({
  component: LoginForm,
});

function LoginForm() {
  const { redirectUrl } = Route.useRouteContext();

  const { mutate: loginMutate, isPending } = useMutation({
    mutationFn: async (data: { username: string; password: string }) =>
      await authClient.signIn.username(
        {
          ...data,
          callbackURL: redirectUrl,
        },
        {
          onError: ({ error }) => {
            toast.error(error.message || "An error occurred while signing in.");
          },
        },
      ),
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isPending) return;

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) return;

    loginMutate({ username, password });
  };

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link to="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <TrophyIcon className="h-6 w-6 text-slate-950" />
              </div>
            </Link>
            <div>
              <span className="bg-linear-to-r from-emerald-400 to-teal-200 bg-clip-text text-xl font-black tracking-widest text-transparent uppercase">
                AUCTION-IT
              </span>
              <h1 className="mt-2 text-sm font-bold text-slate-300">
                Control Hub Authentication Gate
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-5">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="username"
                readOnly={isPending}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password here"
                readOnly={isPending}
                required
              />
            </div>
            <Button type="submit" className="mt-2 w-full" size="lg" disabled={isPending}>
              {isPending && <LoaderCircleIcon className="animate-spin" />}
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link to="/signup" className="underline underline-offset-4">
          Sign up
        </Link>
      </div>
    </div>
  );
}
