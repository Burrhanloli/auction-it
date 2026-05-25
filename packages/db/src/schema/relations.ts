import { defineRelations } from "drizzle-orm";

import {
  auctions,
  categories,
  teams,
  players,
  wishlists,
  auctionState,
  auctionLogs,
} from "./auction.schema";
import { user } from "./auth.schema";

export const relations = defineRelations(
  {
    auctions,
    categories,
    teams,
    players,
    wishlists,
    auctionState,
    auctionLogs,
    user,
  },
  (r) => ({
    user: {
      auctions: r.many.auctions(),
    },
    auctions: {
      user: r.one.user({
        from: r.auctions.userId,
        to: r.user.id,
      }),
      categories: r.many.categories(),
      teams: r.many.teams(),
      players: r.many.players(),
      auctionState: r.one.auctionState({
        from: r.auctions.id,
        to: r.auctionState.auctionId,
      }),
      logs: r.many.auctionLogs(),
    },
    categories: {
      auction: r.one.auctions({
        from: r.categories.auctionId,
        to: r.auctions.id,
      }),
      players: r.many.players(),
    },
    teams: {
      auction: r.one.auctions({
        from: r.teams.auctionId,
        to: r.auctions.id,
      }),
      players: r.many.players(),
      wishlists: r.many.wishlists(),
      captainPlayer: r.one.players({
        from: r.teams.captainPlayerId,
        to: r.players.id,
      }),
      logs: r.many.auctionLogs(),
    },
    players: {
      auction: r.one.auctions({
        from: r.players.auctionId,
        to: r.auctions.id,
      }),
      category: r.one.categories({
        from: r.players.categoryId,
        to: r.categories.id,
      }),
      soldToTeam: r.one.teams({
        from: r.players.soldToTeamId,
        to: r.teams.id,
      }),
      wishlists: r.many.wishlists(),
    },
    wishlists: {
      team: r.one.teams({
        from: r.wishlists.teamId,
        to: r.teams.id,
      }),
      player: r.one.players({
        from: r.wishlists.playerId,
        to: r.players.id,
      }),
    },
    auctionState: {
      auction: r.one.auctions({
        from: r.auctionState.auctionId,
        to: r.auctions.id,
      }),
      currentPlayer: r.one.players({
        from: r.auctionState.currentPlayerId,
        to: r.players.id,
      }),
      currentHighestBidderTeam: r.one.teams({
        from: r.auctionState.currentHighestBidderTeamId,
        to: r.teams.id,
      }),
    },
    auctionLogs: {
      auction: r.one.auctions({
        from: r.auctionLogs.auctionId,
        to: r.auctions.id,
      }),
      team: r.one.teams({
        from: r.auctionLogs.teamId,
        to: r.teams.id,
      }),
    },
  }),
);
