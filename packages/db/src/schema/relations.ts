import { relations } from "drizzle-orm";

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

export const usersRelations = relations(user, ({ many }) => ({
  auctions: many(auctions),
}));

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  user: one(user, {
    fields: [auctions.userId],
    references: [user.id],
  }),
  categories: many(categories),
  teams: many(teams),
  players: many(players),
  auctionState: one(auctionState, {
    fields: [auctions.id],
    references: [auctionState.auctionId],
  }),
  logs: many(auctionLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  auction: one(auctions, {
    fields: [categories.auctionId],
    references: [auctions.id],
  }),
  players: many(players),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  auction: one(auctions, {
    fields: [teams.auctionId],
    references: [auctions.id],
  }),
  players: many(players),
  wishlists: many(wishlists),
  captainPlayer: one(players, {
    fields: [teams.captainPlayerId],
    references: [players.id],
  }),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  auction: one(auctions, {
    fields: [players.auctionId],
    references: [auctions.id],
  }),
  category: one(categories, {
    fields: [players.categoryId],
    references: [categories.id],
  }),
  soldToTeam: one(teams, {
    fields: [players.soldToTeamId],
    references: [teams.id],
  }),
  wishlists: many(wishlists),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  team: one(teams, {
    fields: [wishlists.teamId],
    references: [teams.id],
  }),
  player: one(players, {
    fields: [wishlists.playerId],
    references: [players.id],
  }),
}));

export const auctionStateRelations = relations(auctionState, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionState.auctionId],
    references: [auctions.id],
  }),
  currentPlayer: one(players, {
    fields: [auctionState.currentPlayerId],
    references: [players.id],
  }),
  currentHighestBidderTeam: one(teams, {
    fields: [auctionState.currentHighestBidderTeamId],
    references: [teams.id],
  }),
}));

export const auctionLogsRelations = relations(auctionLogs, ({ one }) => ({
  auction: one(auctions, {
    fields: [auctionLogs.auctionId],
    references: [auctions.id],
  }),
}));
