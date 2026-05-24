import { db } from "@repo/db";
import * as schema from "@repo/db/schema";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function generateRandomSuffix(length = 5): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createDemoDataForUser(userId: string): Promise<void> {
  const auctionName = "Mega Premier League (Demo)";
  const slugVal = `${slugify(auctionName)}-${generateRandomSuffix()}`;

  await db.transaction(async (tx) => {
    // 1. Create Auction
    const [auction] = await tx
      .insert(schema.auctions)
      .values({
        name: auctionName,
        budgetPerTeam: 10000,
        userId,
        slug: slugVal,
        status: "active",
      })
      .returning();

    // 2. Create Categories
    const categoriesToInsert = [
      { name: "Iconic Batsmen", basePoints: 1000 },
      { name: "Spin Wizards", basePoints: 800 },
      { name: "Speed Merchants", basePoints: 800 },
      { name: "All-Rounders", basePoints: 1200 },
    ];

    const insertedCategories = await tx
      .insert(schema.categories)
      .values(
        categoriesToInsert.map((c) => ({
          auctionId: auction.id,
          name: c.name,
          basePoints: c.basePoints,
        })),
      )
      .returning();

    const getCategoryId = (name: string) => {
      const cat = insertedCategories.find((c) => c.name === name);
      if (!cat) throw new Error(`Category ${name} not found`);
      return cat.id;
    };

    // 3. Create Teams
    const teamsToInsert = [
      { name: "Mumbai Mavericks", ownerName: "Vikram", captainName: "Rohit", passcode: "111111" },
      { name: "Chennai Supernovas", ownerName: "Anand", captainName: "Dhoni", passcode: "222222" },
      { name: "Bangalore Blasters", ownerName: "Raj", captainName: "Virat", passcode: "333333" },
      { name: "Kolkata Knights", ownerName: "Gaurav", captainName: "Shreyas", passcode: "444444" },
    ];

    await tx.insert(schema.teams).values(
      teamsToInsert.map((t) => ({
        auctionId: auction.id,
        name: t.name,
        ownerName: t.ownerName,
        captainName: t.captainName,
        totalBudget: 10000,
        remainingBudget: 10000,
        passcode: t.passcode,
        slug: `${slugify(t.name)}-${generateRandomSuffix()}`,
      })),
    );

    // 4. Create Players
    const playersToInsert = [
      // Iconic Batsmen
      { name: "Virat Kohli", skills: "Right-hand Batsman", categoryName: "Iconic Batsmen" },
      { name: "Rohit Sharma", skills: "Right-hand Batsman", categoryName: "Iconic Batsmen" },
      { name: "Steve Smith", skills: "Right-hand Batsman", categoryName: "Iconic Batsmen" },
      { name: "Kane Williamson", skills: "Right-hand Batsman", categoryName: "Iconic Batsmen" },

      // Spin Wizards
      { name: "Rashid Khan", skills: "Leg-spinner", categoryName: "Spin Wizards" },
      { name: "Yuzvendra Chahal", skills: "Leg-spinner", categoryName: "Spin Wizards" },
      { name: "Ravi Ashwin", skills: "Off-spinner", categoryName: "Spin Wizards" },

      // Speed Merchants
      { name: "Jasprit Bumrah", skills: "Right-arm Fast", categoryName: "Speed Merchants" },
      { name: "Mitchell Starc", skills: "Left-arm Fast", categoryName: "Speed Merchants" },
      { name: "Trent Boult", skills: "Left-arm Fast", categoryName: "Speed Merchants" },

      // All-Rounders
      { name: "Hardik Pandya", skills: "All-rounder (Fast)", categoryName: "All-Rounders" },
      { name: "Ravindra Jadeja", skills: "All-rounder (Spin)", categoryName: "All-Rounders" },
      { name: "Glenn Maxwell", skills: "All-rounder (Spin)", categoryName: "All-Rounders" },
    ];

    await tx.insert(schema.players).values(
      playersToInsert.map((p) => ({
        auctionId: auction.id,
        categoryId: getCategoryId(p.categoryName),
        name: p.name,
        skills: p.skills,
        status: "unsold" as const,
      })),
    );

    // 5. Create Default Auction State
    await tx.insert(schema.auctionState).values({
      auctionId: auction.id,
      stage: "paused",
    });

    // 6. Create Initial Log
    await tx.insert(schema.auctionLogs).values({
      auctionId: auction.id,
      message: `Mega Premier League (Demo) was successfully configured. Welcome!`,
    });
  });
}
