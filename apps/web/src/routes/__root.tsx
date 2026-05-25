import type { AuthQueryResult } from "@repo/auth/tanstack/queries";
import { Toaster } from "@repo/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TrophyIcon } from "lucide-react";
import React, { Suspense } from "react";

import appCss from "#/styles.css?url";

const Devtools =
  process.env.NODE_ENV === "production"
    ? () => null
    : React.lazy(() =>
        Promise.all([
          import("@tanstack/react-devtools"),
          import("@tanstack/react-query-devtools"),
          import("@tanstack/react-router-devtools"),
          import("@tanstack/react-form-devtools"),
          import("@tanstack/devtools-a11y/react"),
        ]).then(([core, query, router, form, a11y]) => {
          return {
            default: () => (
              <core.TanStackDevtools
                plugins={[
                  {
                    name: "TanStack Query",
                    render: <query.ReactQueryDevtoolsPanel />,
                  },
                  {
                    name: "TanStack Router",
                    render: <router.TanStackRouterDevtoolsPanel />,
                  },
                  form.formDevtoolsPlugin(),
                  a11y.a11yDevtoolsPlugin(),
                ]}
              />
            ),
          };
        }),
      );

interface MyRouterContext {
  queryClient: QueryClient;
  user: AuthQueryResult;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  // Typically we don't need the user immediately in landing pages.
  // For protected routes with loader data, see /_auth/route.tsx
  // beforeLoad: ({ context }) => {
  //   context.queryClient.prefetchQuery(authQueryOptions());
  // },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "auction-it",
      },
      {
        name: "description",
        content: "A TanStack Start project scaffolded with create-mugnavo.",
      },
    ],
    links: [
      // Replace with your icons here, or remove if you have a favicon.ico in public/
      {
        rel: "icon",
        href: "https://mugnavo.com/favicon.ico",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootDocument,
});
import { useScrollDirection } from "#/hooks/use-scroll-direction";

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  const { scrollDirection } = useScrollDirection();

  return (
    // suppress since we're updating the "dark" class in ThemeProvider
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <div className="flex grow flex-col">{children}</div>
          <footer
            className={`sticky bottom-0 z-50 w-full border-t border-[#3c3c3c] bg-black px-6 py-4 transition-transform duration-300 ease-in-out ${
              scrollDirection === "down" ? "translate-y-full" : "translate-y-0"
            }`}
          >
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
                  <TrophyIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
                  AUCTION-IT
                </span>
              </div>
              <p className="text-center text-[10px] text-[#bbbbbb] md:text-left">
                © 2026 created by Burhanuddin Loliwala. All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
        <Toaster richColors />

        <Suspense>
          <Devtools />
        </Suspense>

        <Scripts />
      </body>
    </html>
  );
}
