import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useAuctionSubscription(auctionId: string, additionalKeys: string[][] = []) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const eventSource = new EventSource(`/api/auction/${auctionId}/stream`);

    eventSource.onmessage = () => {
      // Invalidate general auction queries
      queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });

      // Invalidate additional query keys passed in
      for (const key of additionalKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
    };

    return () => {
      eventSource.close();
    };
  }, [auctionId, queryClient, JSON.stringify(additionalKeys)]);
}
