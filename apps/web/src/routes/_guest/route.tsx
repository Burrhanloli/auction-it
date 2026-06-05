import { authQueryOptions } from "@repo/auth/tanstack/queries";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_guest")({
  component: RouteComponent,
  beforeLoad: async ({ context }) => {
    // Redirect path when user is already present,
    // or after successful login/signup
    const REDIRECT_URL = "/admin";

    const user = await context.queryClient.ensureQueryData({
      ...authQueryOptions(),
      revalidateIfStale: true,
    });
    if (user) {
      throw redirect({
        to: REDIRECT_URL,
      });
    }

    return {
      redirectUrl: REDIRECT_URL,
    };
  },
});

function RouteComponent() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-neutral-950 p-6 text-white md:p-10">
      <div className="relative w-full max-w-md rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-8">
        <Outlet />
      </div>
    </div>
  );
}
