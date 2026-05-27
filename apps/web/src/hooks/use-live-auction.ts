import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useLiveAuction(auctionId: string, options?: { intervalMs?: number }) {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState<any[]>([]);
  const intervalMs = options?.intervalMs ?? 5000;

  useEffect(() => {
    const useSse = import.meta.env.VITE_USE_SSE === "true";

    if (useSse) {
      const eventSource = new EventSource(`/api/auction/${auctionId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "state" || data.type === "ticker" || data.type === "team_update") {
            queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
            queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
          }
        } catch (e) {
          // Ignore
        }
      };

      return () => {
        eventSource.close();
      };
    } else {
      // In Cloudflare Workers, in-memory EventEmitter doesn't work across instances.
      // Use short polling to fetch the latest state and logs from the DB.
      const intervalId = setInterval(() => {
        // Trigger queries refetch to get updated database state
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
        queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });
      }, intervalMs);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [auctionId, queryClient, intervalMs]);

  return { logs, setLogs };
}
