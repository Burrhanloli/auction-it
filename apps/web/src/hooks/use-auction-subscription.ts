import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAuctionSubscription(auctionId: string, additionalKeys: string[][] = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // In Cloudflare Workers, in-memory EventEmitter doesn't work across multiple instances.
    // Use short polling as a robust fallback for realtime updates.
    const intervalId = setInterval(() => {
      // Invalidate general auction queries
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });

      // Invalidate additional query keys passed in
      for (const key of additionalKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    }, 5000); // Poll every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [auctionId, queryClient, JSON.stringify(additionalKeys)]);
}
