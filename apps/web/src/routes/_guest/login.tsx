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
              <div className="flex h-12 w-12 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
                <TrophyIcon className="h-6 w-6 text-white" />
              </div>
            </Link>
            <div>
              <span className="text-xl font-bold tracking-[1.5px] text-white uppercase">
                AUCTION-IT
              </span>
              <h1 className="mt-2 text-xs font-semibold tracking-[1.5px] text-[#bbbbbb] uppercase">
                Control Hub Authentication Gate
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-5">
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
                suppressHydrationWarning
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
                placeholder="Enter password here"
                readOnly={isPending}
                className="h-12 rounded-none border-[#3c3c3c] bg-black text-white placeholder-[#7e7e7e] focus:border-white"
                required
                suppressHydrationWarning
              />
            </div>
            <Button
              type="submit"
              className="mt-4 h-12 w-full rounded-none border border-white bg-white font-bold tracking-[1.5px] text-black uppercase transition-colors hover:bg-black hover:text-white"
              disabled={isPending}
              suppressHydrationWarning
            >
              {isPending && <LoaderCircleIcon className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
        </div>
      </form>

      <div className="text-center text-sm text-[#bbbbbb]">
        Don&apos;t have an account?{" "}
        <Link
          to="/signup"
          className="font-bold tracking-[1.5px] text-white uppercase hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
