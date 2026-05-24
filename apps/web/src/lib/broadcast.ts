import { EventEmitter } from "events";

import { db } from "@repo/db";

import { isUuid } from "./slug";

export const auctionEmitter = new EventEmitter();

// Allow plenty of simultaneous active event listeners for live viewer streams
auctionEmitter.setMaxListeners(5000);

export async function publishAuctionUpdate(
  auctionIdOrSlug: string,
  type: "state" | "ticker" | "team_update" | "wishlist_update",
  payload: any,
) {
  let slug = auctionIdOrSlug;
  let uuid = auctionIdOrSlug;

  try {
    if (isUuid(auctionIdOrSlug)) {
      const auction = await db.query.auctions.findFirst({
        columns: { slug: true },
        where: {
          id: auctionIdOrSlug,
        },
      });
      if (auction?.slug) {
        slug = auction.slug;
      }
    } else {
      const auction = await db.query.auctions.findFirst({
        columns: { id: true },
        where: {
          slug: auctionIdOrSlug,
        },
      });
      if (auction?.id) {
        uuid = auction.id;
      }
    }
  } catch (err) {
    console.error("Error resolving auction for broadcast:", err);
  }

  // Emit on both channels (slug and UUID) to support both subscriber formats
  auctionEmitter.emit(`update:${slug}`, {
    type,
    payload,
    timestamp: Date.now(),
  });

  if (uuid !== slug) {
    auctionEmitter.emit(`update:${uuid}`, {
      type,
      payload,
      timestamp: Date.now(),
    });
  }
}
