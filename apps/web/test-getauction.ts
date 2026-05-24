import { db } from "@repo/db";

import { resolveAuctionId } from "./src/lib/auction-helpers.server";

async function main() {
  try {
    const auctions = await db.query.auctions.findMany({ limit: 1 });
    if (auctions.length === 0) {
      console.log("No auctions found in DB");
      return;
    }
    const slug = auctions[0].slug;
    console.log("Testing with slug:", slug);

    const resolvedId = await resolveAuctionId(slug);
    console.log("Resolved ID:", resolvedId);

    const auctionData = await db.query.auctions.findFirst({
      where: {
        id: resolvedId,
      } as any,
      with: {
        categories: true,
        teams: {
          orderBy: (teams: any, { asc }: any) => [asc(teams.name)],
        },
        players: {
          with: {
            category: true,
            soldToTeam: true,
          },
          orderBy: (players: any, { asc }: any) => [asc(players.name)],
        },
      },
    });
    console.log("Found auctionData?", !!auctionData);
  } catch (e: any) {
    console.log("Error:", e.message);
  }
}
main().catch(console.error);
