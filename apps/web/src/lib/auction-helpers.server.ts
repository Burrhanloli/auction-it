import { db } from "@repo/db";

import { isUuid } from "./slug";

export async function resolveAuctionId(idOrSlug: string): Promise<string> {
  if (isUuid(idOrSlug)) {
    return idOrSlug;
  }
  const auction = await db.query.auctions.findFirst({
    columns: { id: true },
    where: {
      slug: idOrSlug,
    },
  });
  if (!auction) {
    throw new Error(`Auction not found for identifier: ${idOrSlug}`);
  }
  return auction.id;
}

export async function resolveTeamId(idOrSlug: string): Promise<string> {
  if (isUuid(idOrSlug)) {
    return idOrSlug;
  }
  const team = await db.query.teams.findFirst({
    columns: { id: true },
    where: {
      slug: idOrSlug,
    },
  });
  if (!team) {
    throw new Error(`Team not found for identifier: ${idOrSlug}`);
  }
  return team.id;
}
