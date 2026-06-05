import { useState, useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useTeamSession(auctionId: string, teamId: string | null | undefined) {
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [localOverride, setLocalOverride] = useState<string | null | undefined>(undefined);
  const [prevAuctionId, setPrevAuctionId] = useState(auctionId);
  const [prevTeamId, setPrevTeamId] = useState(teamId);

  // Adjust state inline during render to reset the local override on prop change
  if (auctionId !== prevAuctionId || teamId !== prevTeamId) {
    setPrevAuctionId(auctionId);
    setPrevTeamId(teamId);
    setLocalOverride(undefined);
  }

  let verifiedTeamId: string | null = null;
  if (localOverride !== undefined) {
    verifiedTeamId = localOverride;
  } else if (isClient) {
    const stored = localStorage.getItem(`auction-session-${auctionId}`);
    if (stored && (!teamId || stored === teamId)) {
      verifiedTeamId = stored;
    }
  }

  const sessionLoading = !isClient;

  return {
    verifiedTeamId,
    setVerifiedTeamId: (val: string | null) => setLocalOverride(val),
    sessionLoading,
  };
}
