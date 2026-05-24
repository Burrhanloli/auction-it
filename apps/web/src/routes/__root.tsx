import type { AuthQueryResult } from "@repo/auth/tanstack/queries";
import { Toaster } from "@repo/ui/components/sonner";
import { a11yDevtoolsPlugin } from "@tanstack/devtools-a11y/react";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TrophyIcon } from "lucide-react";

import appCss from "#/styles.css?url";

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

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  return (
    // suppress since we're updating the "dark" class in ThemeProvider
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <div className="flex min-h-screen flex-col">
          <div className="flex grow flex-col">{children}</div>
          <footer className="sticky bottom-0 z-50 w-full border-t border-[#3c3c3c] bg-black px-6 py-4">
            <div className="mx-auto flex max-w-7xl items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-none border border-[#3c3c3c] bg-[#1a1a1a] p-0.5">
                  <TrophyIcon className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold tracking-[1.5px] text-white uppercase">
                  AUCTION-IT
                </span>
              </div>
              <p className="text-[10px] text-[#bbbbbb]">
                © 2026 created by Burhanuddin Loliwala. All Rights Reserved.
              </p>
            </div>
          </footer>
        </div>
        <Toaster richColors />

        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            formDevtoolsPlugin(),
            a11yDevtoolsPlugin(),
          ]}
        />

        <Scripts />
      </body>
    </html>
  );
}
