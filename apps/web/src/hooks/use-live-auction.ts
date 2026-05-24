import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function useLiveAuction(auctionId: string) {
  const queryClient = useQueryClient();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const eventSource = new EventSource(`/api/auction/${auctionId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "init") {
          console.log("SSE Real-time Channel Established");
          return;
        }

        // Trigger queries refetch to get updated database state
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
        queryClient.invalidateQueries({ queryKey: ["auction-state", auctionId] });

        // If it's a ticker event, append it to the logs locally for low latency
        if (data.type === "ticker") {
          setLogs((prev) => [
            {
              id: Math.random().toString(),
              auctionId,
              message: data.payload.message,
              createdAt: new Date().toISOString() as any,
            },
            ...prev,
          ]);
        }
      } catch (err) {
        console.error("Error parsing SSE update:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE stream error, re-establishing...", err);
    };

    return () => {
      eventSource.close();
    };
  }, [auctionId, queryClient]);

  return { logs, setLogs };
}
