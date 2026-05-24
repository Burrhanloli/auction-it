import { useState, useEffect } from "react";

export function useTeamSession(auctionId: string, teamId?: string) {
  const [verifiedTeamId, setVerifiedTeamId] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`auction-session-${auctionId}`);
      if (stored && (!teamId || stored === teamId)) {
        setVerifiedTeamId(stored);
      } else {
        setVerifiedTeamId(null);
      }
      setSessionLoading(false);
    }
  }, [auctionId, teamId]);

  return { verifiedTeamId, setVerifiedTeamId, sessionLoading };
}
