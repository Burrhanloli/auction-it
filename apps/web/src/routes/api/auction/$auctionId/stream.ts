import { createFileRoute } from "@tanstack/react-router";

import { resolveAuctionId } from "#/lib/auction-helpers.server";
import { auctionEmitter } from "#/lib/broadcast";

export const Route = createFileRoute("/api/auction/$auctionId/stream")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { auctionId } = params;

        let resolvedId = auctionId;
        try {
          resolvedId = await resolveAuctionId(auctionId);
        } catch (err) {
          console.error("Error resolving auction ID in stream route:", err);
        }

        let intervalId: any;

        const stream = new ReadableStream({
          start(controller) {
            // Immediate connection message
            controller.enqueue(
              new TextEncoder().encode(
                `data: ${JSON.stringify({ type: "init", payload: { connected: true } })}\n\n`,
              ),
            );

            // Listener to pipe updates
            const listener = (event: any) => {
              try {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`));
              } catch (err) {
                console.error("Error writing to SSE stream:", err);
              }
            };

            // Register listener for both UUID and slug to be absolutely safe
            auctionEmitter.on(`update:${resolvedId}`, listener);
            if (resolvedId !== auctionId) {
              auctionEmitter.on(`update:${auctionId}`, listener);
            }

            // Periodically send keep-alive comment so the connection stays open
            intervalId = setInterval(() => {
              try {
                controller.enqueue(new TextEncoder().encode(": keep-alive\n\n"));
              } catch (err) {
                // Ignore if closed
              }
            }, 15000);

            // Clean up when client disconnects
            request.signal.addEventListener("abort", () => {
              clearInterval(intervalId);
              auctionEmitter.off(`update:${resolvedId}`, listener);
              if (resolvedId !== auctionId) {
                auctionEmitter.off(`update:${auctionId}`, listener);
              }
            });
          },
          cancel() {
            if (intervalId) clearInterval(intervalId);
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
