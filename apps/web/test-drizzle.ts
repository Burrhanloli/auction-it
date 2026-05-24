import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  try {
    const auction1 = await db.query.auctions.findFirst({
      where: {
        slug: "some-slug",
      } as any,
    });
    console.log("Auction 1:", auction1?.id);
  } catch (e: any) {
    console.log("Error 1:", e.message);
  }

  try {
    const auction2 = await db.query.auctions.findFirst({
      where: (auctions, { eq }) => eq(auctions.slug, "some-slug"),
    });
    console.log("Auction 2:", auction2?.id);
  } catch (e: any) {
    console.log("Error 2:", e.message);
  }
}

main().catch(console.error);
