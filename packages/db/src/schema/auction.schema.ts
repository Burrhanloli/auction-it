import { pgTable, text, integer, timestamp, uuid, index, AnyPgColumn } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const auctions = pgTable("auctions", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  status: text("status").$type<"draft" | "active" | "completed">().default("draft").notNull(),
  budgetPerTeam: integer("budget_per_team").default(1000).notNull(),
  minPlayersPerSquad: integer("min_players_per_squad"),
  maxPlayersPerSquad: integer("max_players_per_squad"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // Elite, Pro, Batsmen, etc.
  basePoints: integer("base_points").default(100).notNull(),
  minPlayersPerCategory: integer("min_players_per_category"),
  maxPlayersPerCategory: integer("max_players_per_category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teams = pgTable("teams", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique(),
  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  ownerName: text("owner_name").notNull(),
  ownerImageUrl: text("owner_image_url"),
  captainPlayerId: uuid("captain_player_id").references((): AnyPgColumn => players.id, {
    onDelete: "set null",
  }),
  totalBudget: integer("total_budget").notNull(),
  remainingBudget: integer("remaining_budget").notNull(),
  passcode: text("passcode").notNull(), // 6-digit passcode for Strategy Deck
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const players = pgTable("players", {
  id: uuid("id").defaultRandom().primaryKey(),
  auctionId: uuid("auction_id")
    .notNull()
    .references(() => auctions.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  skills: text("skills").notNull(), // e.g. "Right-hand Batsman, Leg-spinner"
  imageUrl: text("image_url"),
  status: text("status").$type<"unsold" | "sold" | "captain">().default("unsold").notNull(),
  soldToTeamId: uuid("sold_to_team_id").references((): AnyPgColumn => teams.id, {
    onDelete: "set null",
  }),
  soldPoints: integer("sold_points"),
  drawCount: integer("draw_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const wishlists = pgTable(
  "wishlists",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    playerId: uuid("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("wishlist_team_player_idx").on(table.teamId, table.playerId)],
);

export const auctionState = pgTable("auction_state", {
  auctionId: uuid("auction_id")
    .primaryKey()
    .references(() => auctions.id, { onDelete: "cascade" }),
  currentPlayerId: uuid("current_player_id").references(() => players.id, { onDelete: "set null" }),
  currentBidPoints: integer("current_bid_points").default(0).notNull(),
  currentHighestBidderTeamId: uuid("current_highest_bidder_team_id").references(() => teams.id, {
    onDelete: "set null",
  }),
  stage: text("stage")
    .$type<"paused" | "bidding" | "sold" | "unsold">()
    .default("paused")
    .notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const auctionLogs = pgTable(
  "auction_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),
    teamId: uuid("team_id").references((): AnyPgColumn => teams.id, { onDelete: "set null" }),
    actionType: text("action_type").$type<"info" | "sold" | "unsold">().default("info").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("auction_logs_auction_idx").on(table.auctionId)],
);
