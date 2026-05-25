import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import * as schema from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq, and, desc } from "drizzle-orm";

import { resolveAuctionId, resolveTeamId } from "./auction-helpers.server";
import { publishAuctionUpdate } from "./broadcast";
import { slugify, generateRandomSuffix } from "./slug";

// Query: Get full details of an auction including categories, teams, and players
export const $getAuction = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: auctionId }) => {
    const resolvedId = await resolveAuctionId(auctionId);
    const auctionData = await db.query.auctions.findFirst({
      where: {
        id: resolvedId,
      },
      with: {
        categories: true,
        teams: {
          with: { captainPlayer: true },
          orderBy: (teams, { asc }) => [asc(teams.name)],
        },
        players: {
          with: {
            category: true,
            soldToTeam: true,
          },
          orderBy: (players, { asc }) => [asc(players.name)],
        },
      },
    });
    return auctionData;
  });

// Query: Get dynamic real-time auction state, active player, logs, and current teams
export const $getAuctionState = createServerFn({ method: "GET" })
  .inputValidator((id: string) => id)
  .handler(async ({ data: auctionId }) => {
    const resolvedId = await resolveAuctionId(auctionId);
    const state = await db.query.auctionState.findFirst({
      where: {
        auctionId: resolvedId,
      },
      with: {
        currentPlayer: {
          with: {
            category: true,
          },
        },
        currentHighestBidderTeam: true,
      },
    });

    const logs = await db.query.auctionLogs.findMany({
      where: {
        auctionId: resolvedId,
      },
      with: {
        team: true,
      },
      orderBy: (auctionLogs, { desc }) => [desc(auctionLogs.createdAt)],
      limit: 100,
    });

    return { state, logs };
  });

// Mutation: Create a new independent auction with dynamic categories
export const $createAuction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      name: string;
      budgetPerTeam: number;
      logoUrl: string | null;
      categories: Array<{ name: string; basePoints: number }>;
    }) => data,
  )
  .handler(async ({ data, context }) => {
    const userId = context.user.id;

    // Use transaction for safe multi-table creation
    const slugVal = `${slugify(data.name)}-${generateRandomSuffix()}`;
    const auction = await (async () => {
      // 1. Create Auction
      const [auction] = await db
        .insert(schema.auctions)
        .values({
          name: data.name,
          budgetPerTeam: data.budgetPerTeam,
          logoUrl: data.logoUrl,
          userId,
          slug: slugVal,
        })
        .returning();

      // 2. Create Categories
      if (data.categories.length > 0) {
        await db.insert(schema.categories).values(
          data.categories.map((c) => ({
            auctionId: auction.id,
            name: c.name,
            basePoints: c.basePoints,
          })),
        );
      }

      // 3. Create Default Auction State
      await db.insert(schema.auctionState).values({
        auctionId: auction.id,
        stage: "paused",
      });

      // 4. Create initial log entry
      await db.insert(schema.auctionLogs).values({
        auctionId: auction.id,
        message: `Auction "${data.name}" was successfully configured.`,
      });

      return auction;
    })();

    return { auctionId: auction.slug };
  });

// Mutation: Update an existing independent auction
export const $updateAuction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      auctionId: string;
      slug: string;
      name: string;
      budgetPerTeam: number;
      logoUrl: string | null;
      categories: Array<{ id?: string; name: string; basePoints: number }>;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedId = await resolveAuctionId(data.auctionId);

    const result = await (async () => {
      // 1. Get existing to resolve suffix
      const existing = await db.query.auctions.findFirst({
        where: {
          id: resolvedId,
        },
      });
      if (!existing) throw new Error("Auction not found");

      const parts = (existing.slug || "").split("-");
      const suffix = parts.length > 1 ? parts[parts.length - 1] : generateRandomSuffix();
      const newSlug = `${slugify(data.slug)}-${suffix}`;

      // 2. Update Auction metadata
      await db
        .update(schema.auctions)
        .set({
          name: data.name,
          budgetPerTeam: data.budgetPerTeam,
          logoUrl: data.logoUrl,
          slug: newSlug,
        })
        .where(eq(schema.auctions.id, resolvedId));

      // 3. Safe Category Diffing to preserve active player assignments
      const existingCats = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.auctionId, resolvedId));

      const inputCatIds = data.categories.map((c) => c.id).filter(Boolean) as string[];

      // Delete categories that are omitted from the new configuration
      for (const exc of existingCats) {
        if (!inputCatIds.includes(exc.id)) {
          await db.delete(schema.categories).where(eq(schema.categories.id, exc.id));
        }
      }

      // Upsert current configuration
      for (const inputCat of data.categories) {
        if (inputCat.id) {
          // Update
          await db
            .update(schema.categories)
            .set({
              name: inputCat.name,
              basePoints: inputCat.basePoints,
            })
            .where(eq(schema.categories.id, inputCat.id));
        } else {
          // Insert
          await db.insert(schema.categories).values({
            auctionId: resolvedId,
            name: inputCat.name,
            basePoints: inputCat.basePoints,
          });
        }
      }

      // Log setup update
      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedId,
        message: `Auction setup was updated (Budget: ${data.budgetPerTeam} pts).`,
      });

      return { newSlug };
    })();

    // Notify connected streams
    publishAuctionUpdate(resolvedId, "state", {});
    return { success: true, slug: result.newSlug };
  });

// Mutation: Change auction status (e.g. draft to active)
export const $updateAuctionStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { auctionId: string; status: "draft" | "active" | "completed" }) => data)
  .handler(async ({ data }) => {
    const resolvedId = await resolveAuctionId(data.auctionId);
    await db
      .update(schema.auctions)
      .set({ status: data.status })
      .where(eq(schema.auctions.id, resolvedId));

    await db.insert(schema.auctionLogs).values({
      auctionId: resolvedId,
      message: `Auction status updated to ${data.status.toUpperCase()}.`,
    });

    publishAuctionUpdate(resolvedId, "state", { status: data.status });
    return { success: true };
  });

// Mutation: Roster Manager - Create a new team with budget and passcode
export const $addTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      auctionId: string;
      name: string;
      logoUrl: string | null;
      ownerName: string;
      ownerImageUrl: string | null;
      totalBudget: number;
      passcode: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedAuctionId = await resolveAuctionId(data.auctionId);
    const slugBase = slugify(data.name);
    const suffix = generateRandomSuffix();
    const slugVal = `${slugBase}-${suffix}`;

    const result = await (async () => {
      const [team] = await db
        .insert(schema.teams)
        .values({
          auctionId: resolvedAuctionId,
          name: data.name,
          logoUrl: data.logoUrl,
          ownerName: data.ownerName,
          ownerImageUrl: data.ownerImageUrl,
          totalBudget: data.totalBudget,
          remainingBudget: data.totalBudget,
          passcode: data.passcode,
          slug: slugVal,
        })
        .returning();

      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedAuctionId,
        message: `Team "${data.name}" (Owner: ${data.ownerName}) registered.`,
      });

      return { teamId: team.id, slug: team.slug };
    })();

    // Notify connected streams that team listings have changed
    publishAuctionUpdate(resolvedAuctionId, "team_update", { teamId: result.teamId });
    return { teamId: result.slug || result.teamId };
  });

// Mutation: Roster Manager - Update a franchise team's details
export const $updateTeam = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      teamId: string;
      slug: string;
      name: string;
      logoUrl: string | null;
      ownerName: string;
      ownerImageUrl: string | null;
      totalBudget: number;
      passcode: string;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedTeamId = await resolveTeamId(data.teamId);

    const result = await (async () => {
      const existing = await db.query.teams.findFirst({
        where: {
          id: resolvedTeamId,
        },
      });
      if (!existing) throw new Error("Team not found");

      const parts = (existing.slug || "").split("-");
      const suffix = parts.length > 1 ? parts[parts.length - 1] : generateRandomSuffix();
      const newSlug = `${slugify(data.slug)}-${suffix}`;

      // Adjust remaining budget based on budget change
      const budgetDiff = data.totalBudget - existing.totalBudget;
      const newRemainingBudget = existing.remainingBudget + budgetDiff;

      await db
        .update(schema.teams)
        .set({
          name: data.name,
          logoUrl: data.logoUrl,
          ownerName: data.ownerName,
          ownerImageUrl: data.ownerImageUrl,
          totalBudget: data.totalBudget,
          remainingBudget: newRemainingBudget,
          passcode: data.passcode,
          slug: newSlug,
        })
        .where(eq(schema.teams.id, resolvedTeamId));

      await db.insert(schema.auctionLogs).values({
        auctionId: existing.auctionId,
        message: `Team "${data.name}" details updated.`,
      });

      return { auctionId: existing.auctionId, slug: newSlug };
    })();

    publishAuctionUpdate(result.auctionId, "team_update", { teamId: resolvedTeamId });
    return { success: true, slug: result.slug };
  });

// Mutation: Player Directory - Create and assign incoming player to a category
export const $addPlayer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      auctionId: string;
      categoryId: string;
      name: string;
      skills: string;
      imageUrl: string | null;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedId = await resolveAuctionId(data.auctionId);
    const player = await db
      .insert(schema.players)
      .values({
        auctionId: resolvedId,
        categoryId: data.categoryId,
        name: data.name,
        skills: data.skills,
        imageUrl: data.imageUrl,
        status: "unsold",
      })
      .returning();

    return { playerId: player[0].id };
  });

// Mutation: Auctioneer Panel - Draw a random player from category and put up for bid
export const $drawPlayer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { auctionId: string; categoryId: string }) => data)
  .handler(async ({ data }) => {
    const resolvedId = await resolveAuctionId(data.auctionId);
    const result = await (async () => {
      // 1. Get unsold players in category
      const unsoldPlayers = await db
        .select()
        .from(schema.players)
        .where(
          and(
            eq(schema.players.auctionId, resolvedId),
            eq(schema.players.categoryId, data.categoryId),
            eq(schema.players.status, "unsold"),
          ),
        );

      if (unsoldPlayers.length === 0) {
        throw new Error("No unsold players left in this category!");
      }

      // 2. Select random player
      const randomIndex = Math.floor(Math.random() * unsoldPlayers.length);
      const chosenPlayer = unsoldPlayers[randomIndex];

      // 3. Get category base points
      const [category] = await db
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.id, data.categoryId));

      const basePoints = category?.basePoints ?? 100;

      // 4. Update player status to 'bidding' to prevent double extraction
      await db
        .update(schema.players)
        .set({ status: "bidding" })
        .where(eq(schema.players.id, chosenPlayer.id));

      // 5. Reset and configure active state
      await db
        .update(schema.auctionState)
        .set({
          currentPlayerId: chosenPlayer.id,
          currentBidPoints: basePoints,
          currentHighestBidderTeamId: null,
          stage: "bidding",
          updatedAt: new Date(),
        })
        .where(eq(schema.auctionState.auctionId, resolvedId));

      // 6. Log dynamic action
      const logMessage = `Player "${chosenPlayer.name}" drawn for bidding (Base: ${basePoints} pts).`;
      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedId,
        message: logMessage,
      });

      return { player: chosenPlayer, basePoints, logMessage };
    })();

    // Broadcast update to open screens instantly
    publishAuctionUpdate(resolvedId, "state", { stage: "bidding" });
    publishAuctionUpdate(resolvedId, "ticker", { message: result.logMessage });

    return { success: true };
  });

// Mutation: Auctioneer Panel - Process an incremental bid request
export const $incrementBid = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((data: { auctionId: string; teamId: string; bidPoints: number }) => data)
  .handler(async ({ data }) => {
    const resolvedAuctionId = await resolveAuctionId(data.auctionId);
    const resolvedTeamId = await resolveTeamId(data.teamId);
    const result = await (async () => {
      // 1. Get current active state
      const state = await db.query.auctionState.findFirst({
        where: {
          auctionId: resolvedAuctionId,
        },
        with: {
          currentPlayer: true,
        },
      });

      if (!state || state.stage !== "bidding" || !state.currentPlayerId) {
        throw new Error("No active bidding in progress!");
      }

      // 2. Validate points increment
      if (data.bidPoints <= state.currentBidPoints) {
        throw new Error(`New bid must be higher than current bid of ${state.currentBidPoints}!`);
      }

      // 3. Get team budget and validate remaining
      const [team] = await db
        .select()
        .from(schema.teams)
        .where(eq(schema.teams.id, resolvedTeamId));

      if (!team) {
        throw new Error("Selected team does not exist!");
      }

      if (data.bidPoints > team.remainingBudget) {
        throw new Error(
          `Insufficient budget! "${team.name}" has only ${team.remainingBudget} points remaining.`,
        );
      }

      // 4. Record new high bid
      await db
        .update(schema.auctionState)
        .set({
          currentBidPoints: data.bidPoints,
          currentHighestBidderTeamId: resolvedTeamId,
          updatedAt: new Date(),
        })
        .where(eq(schema.auctionState.auctionId, resolvedAuctionId));

      // 5. Log the new bid
      const logMessage = `"${team.name}" bid ${data.bidPoints} points for ${state.currentPlayer?.name}.`;
      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedAuctionId,
        message: logMessage,
      });

      return { logMessage };
    })();

    // Broadcast real-time updates
    publishAuctionUpdate(resolvedAuctionId, "state", { stage: "bidding" });
    publishAuctionUpdate(resolvedAuctionId, "ticker", { message: result.logMessage });

    return { success: true };
  });

// Mutation: Auctioneer Panel - Mark current player as SOLD
export const $markSold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((auctionId: string) => auctionId)
  .handler(async ({ data: auctionId }) => {
    const resolvedId = await resolveAuctionId(auctionId);
    const result = await (async () => {
      // 1. Query current state details
      const state = await db.query.auctionState.findFirst({
        where: {
          auctionId: resolvedId,
        },
        with: {
          currentPlayer: true,
          currentHighestBidderTeam: true,
        },
      });

      if (!state || state.stage !== "bidding" || !state.currentPlayerId) {
        throw new Error("No active bidding in progress!");
      }

      if (!state.currentHighestBidderTeamId) {
        throw new Error("Cannot sell player: No team has placed a bid! Mark as Unsold instead.");
      }

      const finalPoints = state.currentBidPoints;
      const buyerTeamId = state.currentHighestBidderTeamId;
      const buyerTeamName = state.currentHighestBidderTeam?.name ?? "Unknown Team";

      // 2. Lock player to sold status
      await db
        .update(schema.players)
        .set({
          status: "sold",
          soldToTeamId: buyerTeamId,
          soldPoints: finalPoints,
        })
        .where(eq(schema.players.id, state.currentPlayerId));

      // 3. Deduct budget from the winning team
      const newRemainingBudget = state.currentHighestBidderTeam!.remainingBudget - finalPoints;
      await db
        .update(schema.teams)
        .set({
          remainingBudget: newRemainingBudget,
        })
        .where(eq(schema.teams.id, buyerTeamId));

      // 4. Transition state to 'sold' stage for celebration screen
      await db
        .update(schema.auctionState)
        .set({
          stage: "sold",
          updatedAt: new Date(),
        })
        .where(eq(schema.auctionState.auctionId, resolvedId));

      // 5. Insert historical ticker log
      const logMessage = `🔨 SOLD: "${state.currentPlayer?.name}" joins "${buyerTeamName}" for ${finalPoints} points!`;
      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedId,
        message: logMessage,
        actionType: "sold",
        teamId: buyerTeamId,
      });

      return { logMessage, buyerTeamId };
    })();

    // Notify connected client layouts
    publishAuctionUpdate(resolvedId, "state", { stage: "sold" });
    publishAuctionUpdate(resolvedId, "ticker", { message: result.logMessage });
    publishAuctionUpdate(resolvedId, "team_update", { teamId: result.buyerTeamId });

    return { success: true };
  });

// Mutation: Auctioneer Panel - Mark current player as UNSOLD
export const $markUnsold = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((auctionId: string) => auctionId)
  .handler(async ({ data: auctionId }) => {
    const resolvedId = await resolveAuctionId(auctionId);
    const result = await (async () => {
      // 1. Get active player details
      const state = await db.query.auctionState.findFirst({
        where: {
          auctionId: resolvedId,
        },
        with: {
          currentPlayer: true,
        },
      });

      if (!state || state.stage !== "bidding" || !state.currentPlayerId) {
        throw new Error("No active bidding in progress!");
      }

      // 2. Set player back to unsold state
      await db
        .update(schema.players)
        .set({
          status: "unsold",
        })
        .where(eq(schema.players.id, state.currentPlayerId));

      // 3. Transition stage to 'unsold'
      await db
        .update(schema.auctionState)
        .set({
          stage: "unsold",
          updatedAt: new Date(),
        })
        .where(eq(schema.auctionState.auctionId, resolvedId));

      // 4. Log event
      const logMessage = `💨 UNSOLD: "${state.currentPlayer?.name}" went unsold.`;
      await db.insert(schema.auctionLogs).values({
        auctionId: resolvedId,
        message: logMessage,
        actionType: "unsold",
      });

      return { logMessage };
    })();

    // Broadcast changes
    publishAuctionUpdate(resolvedId, "state", { stage: "unsold" });
    publishAuctionUpdate(resolvedId, "ticker", { message: result.logMessage });

    return { success: true };
  });

// Query: Verify a 6-digit passcode for team strategy decks
export const $verifyTeamPasscode = createServerFn({ method: "POST" })
  .inputValidator((data: { auctionId: string; teamId: string; passcode: string }) => data)
  .handler(async ({ data }: { data: { auctionId: string; teamId: string; passcode: string } }) => {
    const resolvedAuctionId = await resolveAuctionId(data.auctionId);
    const resolvedTeamId = await resolveTeamId(data.teamId);
    const team = await db.query.teams.findFirst({
      where: {
        auctionId: resolvedAuctionId,
        id: resolvedTeamId,
      },
    });

    if (!team) {
      return { success: false, error: "Team not found!" };
    }

    if (team.passcode !== data.passcode.trim()) {
      return { success: false, error: "Incorrect 6-digit passcode!" };
    }

    return {
      success: true,
      teamId: team.slug || team.id,
      teamName: team.name,
    };
  });

// Query: Retrieve detailed Strategy Deck data for a verified team owner
export const $getTeamStrategyDeck = createServerFn({ method: "GET" })
  .inputValidator((data: { auctionId: string; teamId: string }) => data)
  .handler(async ({ data }: { data: { auctionId: string; teamId: string } }) => {
    const resolvedAuctionId = await resolveAuctionId(data.auctionId);
    const resolvedTeamId = await resolveTeamId(data.teamId);
    const team = await db.query.teams.findFirst({
      where: {
        auctionId: resolvedAuctionId,
        id: resolvedTeamId,
      },
      with: {
        players: {
          with: {
            category: true,
          },
        },
        captainPlayer: true,
      },
    });

    if (!team) {
      throw new Error("Team not found!");
    }

    const wishlistItems = await db
      .select()
      .from(schema.wishlists)
      .where(eq(schema.wishlists.teamId, resolvedTeamId));

    const wishlistPlayerIds = wishlistItems.map((w) => w.playerId);

    const allAuctionPlayers = await db.query.players.findMany({
      where: {
        auctionId: resolvedAuctionId,
      },
      with: {
        category: true,
        soldToTeam: true,
      },
      orderBy: (players, { asc }) => [asc(players.name)],
    });

    return {
      team,
      wishlistPlayerIds,
      allPlayers: allAuctionPlayers,
    };
  });

// Mutation: Toggle private wishlist status of players
export const $toggleWishlist = createServerFn({ method: "POST" })
  .inputValidator((data: { teamId: string; playerId: string; active: boolean }) => data)
  .handler(async ({ data }: { data: { teamId: string; playerId: string; active: boolean } }) => {
    const resolvedTeamId = await resolveTeamId(data.teamId);
    if (data.active) {
      // Add to wishlist if not already exists
      const [existing] = await db
        .select()
        .from(schema.wishlists)
        .where(
          and(
            eq(schema.wishlists.teamId, resolvedTeamId),
            eq(schema.wishlists.playerId, data.playerId),
          ),
        );

      if (!existing) {
        await db.insert(schema.wishlists).values({
          teamId: resolvedTeamId,
          playerId: data.playerId,
        });
      }
    } else {
      // Remove from wishlist
      await db
        .delete(schema.wishlists)
        .where(
          and(
            eq(schema.wishlists.teamId, resolvedTeamId),
            eq(schema.wishlists.playerId, data.playerId),
          ),
        );
    }

    // Find the auctionId from the team
    const [team] = await db
      .select({ auctionId: schema.teams.auctionId })
      .from(schema.teams)
      .where(eq(schema.teams.id, resolvedTeamId));

    if (team) {
      publishAuctionUpdate(team.auctionId, "wishlist_update", { teamId: resolvedTeamId });
    }

    return { success: true };
  });

// Mutation: Select a captain from the roster (Strategy Deck)
export const $selectCaptain = createServerFn({ method: "POST" })
  .inputValidator((data: { teamId: string; playerId: string }) => data)
  .handler(async ({ data }: { data: { teamId: string; playerId: string } }) => {
    const resolvedTeamId = await resolveTeamId(data.teamId);

    const result = await (async () => {
      // 1. Fetch team to verify it exists and get auctionId
      const team = await db.query.teams.findFirst({
        where: { id: resolvedTeamId },
        with: { auction: true },
      });

      if (!team) throw new Error("Team not found!");

      // 2. Fetch the player to be selected
      const player = await db.query.players.findFirst({
        where: { id: data.playerId },
      });

      if (!player) throw new Error("Player not found!");
      if (player.status !== "unsold")
        throw new Error("Player is not available to be selected as captain!");

      // 3. Optional: check if auction has started (e.g., if there are any sold players).
      // If the user wants to block changing after auction starts, we can check if any player is sold.
      const soldPlayersCount = await db.$count(
        schema.players,
        and(eq(schema.players.auctionId, team.auctionId), eq(schema.players.status, "sold")),
      );

      if (soldPlayersCount > 0) {
        throw new Error("Cannot change captain after the auction has started!");
      }

      // 4. Release old captain if exists
      const oldCaptain = await db.query.players.findFirst({
        where: {
          auctionId: team.auctionId,
          soldToTeamId: resolvedTeamId,
          status: "captain",
        },
      });

      if (oldCaptain) {
        await db
          .update(schema.players)
          .set({ status: "unsold", soldToTeamId: null, soldPoints: null })
          .where(eq(schema.players.id, oldCaptain.id));
      }

      // 5. Update new captain
      await db
        .update(schema.players)
        .set({ status: "captain", soldToTeamId: resolvedTeamId, soldPoints: 0 })
        .where(eq(schema.players.id, player.id));

      // 6. Update team record
      await db
        .update(schema.teams)
        .set({
          captainPlayerId: player.id,
        })
        .where(eq(schema.teams.id, resolvedTeamId));

      return { auctionId: team.auctionId };
    })();

    publishAuctionUpdate(result.auctionId, "team_update", { teamId: resolvedTeamId });
    return { success: true };
  });

// Query: Fetch all auctions configured by a user
export const $getAuctionsByUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const list = await db
      .select()
      .from(schema.auctions)
      .where(eq(schema.auctions.userId, context.user.id))
      .orderBy(desc(schema.auctions.createdAt));
    return list;
  });

// Query: Fetch all auctions for public dashboard listing
export const $getAllAuctions = createServerFn({ method: "GET" }).handler(async () => {
  const list = await db.select().from(schema.auctions).orderBy(desc(schema.auctions.createdAt));
  return list;
});

// Mutation: Roster Manager - Create multiple teams from CSV
export const $addTeamsBulk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      auctionId: string;
      teams: Array<{
        name: string;
        logoUrl: string | null;
        ownerName: string;
        ownerImageUrl: string | null;
        totalBudget: number;
        passcode: string;
      }>;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedAuctionId = await resolveAuctionId(data.auctionId);

    if (data.teams.length === 0) return { success: true };

    const teamsToInsert = data.teams.map((team) => {
      const slugBase = slugify(team.name);
      const suffix = generateRandomSuffix();
      return {
        auctionId: resolvedAuctionId,
        name: team.name,
        logoUrl: team.logoUrl,
        ownerName: team.ownerName,
        ownerImageUrl: team.ownerImageUrl,
        totalBudget: team.totalBudget,
        remainingBudget: team.totalBudget,
        passcode: team.passcode,
        slug: `${slugBase}-${suffix}`,
      };
    });

    await db.insert(schema.teams).values(teamsToInsert);

    await db.insert(schema.auctionLogs).values({
      auctionId: resolvedAuctionId,
      message: `Bulk uploaded ${data.teams.length} teams.`,
    });

    // Notify connected streams that team listings have changed
    publishAuctionUpdate(resolvedAuctionId, "team_update", {});
    return { success: true, count: data.teams.length };
  });

// Mutation: Player Directory - Create multiple players from CSV
export const $addPlayersBulk = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(
    (data: {
      auctionId: string;
      players: Array<{
        categoryId: string;
        name: string;
        skills: string;
        imageUrl: string | null;
      }>;
    }) => data,
  )
  .handler(async ({ data }) => {
    const resolvedId = await resolveAuctionId(data.auctionId);

    if (data.players.length === 0) return { success: true };

    const playersToInsert = data.players.map((player) => ({
      auctionId: resolvedId,
      categoryId: player.categoryId,
      name: player.name,
      skills: player.skills,
      imageUrl: player.imageUrl,
      status: "unsold" as const,
    }));

    await db.insert(schema.players).values(playersToInsert);

    await db.insert(schema.auctionLogs).values({
      auctionId: resolvedId,
      message: `Bulk uploaded ${data.players.length} players.`,
    });

    return { success: true, count: data.players.length };
  });
