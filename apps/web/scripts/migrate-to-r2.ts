import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@repo/db";
import { players, teams, auctions } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import sharp from "sharp";

// Validate env vars
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
const R2_FOLDER_NAME = process.env.R2_FOLDER_NAME;

if (
  !R2_ACCOUNT_ID ||
  !R2_ACCESS_KEY_ID ||
  !R2_SECRET_ACCESS_KEY ||
  !R2_BUCKET_NAME ||
  !R2_PUBLIC_URL ||
  !R2_FOLDER_NAME
) {
  console.error("Missing required R2 environment variables. Please check your .env file.");
  process.exit(1);
}

const isDryRun = process.argv.includes("--dry-run");
if (isDryRun) {
  console.log("--- DRY RUN MODE: No images will be uploaded or updated ---");
}

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

function getDirectImageUrl(url: string): string {
  let fileId = "";

  const lh3Match = url.match(/lh3\.google\.com\/u\/\d+\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match) fileId = lh3Match[1];

  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch) fileId = driveFileMatch[1];

  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (driveOpenMatch) fileId = driveOpenMatch[1];

  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }

  return url;
}

async function processImage(
  url: string,
  logPrefix: string,
  isDryRun: boolean,
): Promise<string | null> {
  if (url.startsWith(R2_PUBLIC_URL!)) {
    console.log(`${logPrefix} Skipping (already on R2): ${url}`);
    return null;
  }

  try {
    const fetchUrl = getDirectImageUrl(url);
    console.log(`${logPrefix} Downloading: ${fetchUrl}`);
    const response = await fetch(fetchUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const contentType = response.headers.get("content-type");
    if (
      !contentType ||
      (!contentType.startsWith("image/") && !contentType.includes("octet-stream"))
    ) {
      console.warn(
        `${logPrefix} Skipping: URL did not return an image (Content-Type: ${contentType}). URL might be a webpage or require authentication.`,
      );
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`${logPrefix} Converting to WebP...`);
    const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();

    const fileName = `${R2_FOLDER_NAME}/${uuidv4()}.webp`;

    if (isDryRun) {
      console.log(`${logPrefix} [DRY RUN] Would upload to R2...`);
    } else {
      console.log(`${logPrefix} Uploading to R2...`);
      await s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: fileName,
          Body: webpBuffer,
          ContentType: "image/webp",
        }),
      );
    }

    const finalUrl = `${R2_PUBLIC_URL}/${fileName}`;
    console.log(`${logPrefix} Success: ${finalUrl}`);
    return finalUrl;
  } catch (error: any) {
    console.error(`${logPrefix} Error processing image ${url}:`, error.message);
    return null;
  }
}

async function migratePlayers(isDryRun: boolean) {
  console.log("--- Migrating Players ---");
  const allPlayers = await db.query.players.findMany({
    // where: (players, { and, isNotNull, ilike, notIlike }) =>
    //   and(
    //     isNotNull(players.imageUrl),
    //     ilike(players.imageUrl, "http%"),
    //     notIlike(players.imageUrl, `${R2_PUBLIC_URL}%`),
    //   ),
    where: {
      imageUrl: {
        AND: [{ isNotNull: true }, { like: "http%" }, { notLike: `${R2_PUBLIC_URL}%` }],
      },
    },
  });

  if (isDryRun) {
    console.log(`Found ${allPlayers.length} players to migrate. Continuing dry run...`);
  }

  for (const player of allPlayers) {
    if (!player.imageUrl) continue;
    const newUrl = await processImage(player.imageUrl, `[Player: ${player.name}]`, isDryRun);
    if (newUrl && !isDryRun) {
      await db.update(players).set({ imageUrl: newUrl }).where(eq(players.id, player.id));
    }
  }
}

async function migrateTeams(isDryRun: boolean) {
  console.log("--- Migrating Teams ---");
  const allTeams = await db.query.teams.findMany({
    // where: (teams, { and, isNotNull, ilike, notIlike }) =>
    //   and(
    //     isNotNull(teams.logoUrl),
    //     ilike(teams.logoUrl, "http%"),
    //     notIlike(teams.logoUrl, `${R2_PUBLIC_URL}%`),
    //   ),
    where: {
      logoUrl: {
        AND: [{ isNotNull: true }, { like: "http%" }, { notLike: `${R2_PUBLIC_URL}%` }],
      },
    },
  });

  const allTeamOwners = await db.query.teams.findMany({
    // where: (teams, { and, isNotNull, ilike, notIlike }) =>
    //   and(
    //     isNotNull(teams.ownerImageUrl),
    //     ilike(teams.ownerImageUrl, "http%"),
    //     notIlike(teams.ownerImageUrl, `${R2_PUBLIC_URL}%`),
    //   ),
    where: {
      ownerImageUrl: {
        AND: [{ isNotNull: true }, { like: "http%" }, { notLike: `${R2_PUBLIC_URL}%` }],
      },
    },
  });

  if (isDryRun) {
    console.log(`Found ${allTeams.length} team logos to migrate.`);
    console.log(
      `Found ${allTeamOwners.length} team owner images to migrate. Continuing dry run...`,
    );
  }

  for (const team of allTeams) {
    if (team.logoUrl) {
      const newUrl = await processImage(team.logoUrl, `[Team Logo: ${team.name}]`, isDryRun);
      if (newUrl && !isDryRun) {
        await db.update(teams).set({ logoUrl: newUrl }).where(eq(teams.id, team.id));
      }
    }
  }

  for (const team of allTeamOwners) {
    if (team.ownerImageUrl) {
      const newUrl = await processImage(team.ownerImageUrl, `[Team Owner: ${team.name}]`, isDryRun);
      if (newUrl && !isDryRun) {
        await db.update(teams).set({ ownerImageUrl: newUrl }).where(eq(teams.id, team.id));
      }
    }
  }
}

async function migrateAuctions(isDryRun: boolean) {
  console.log("--- Migrating Auctions ---");
  const allAuctions = await db.query.auctions.findMany({
    // where: (auctions, { and, isNotNull, ilike, notIlike }) =>
    //   and(
    //     isNotNull(auctions.logoUrl),
    //     ilike(auctions.logoUrl, "http%"),
    //     notIlike(auctions.logoUrl, `${R2_PUBLIC_URL}%`),
    //   ),
    where: {
      logoUrl: {
        AND: [{ isNotNull: true }, { like: "http%" }, { notLike: `${R2_PUBLIC_URL}%` }],
      },
    },
  });

  if (isDryRun) {
    console.log(`Found ${allAuctions.length} auctions to migrate. Continuing dry run...`);
  }

  for (const auction of allAuctions) {
    if (!auction.logoUrl) continue;
    const newUrl = await processImage(auction.logoUrl, `[Auction: ${auction.name}]`, isDryRun);
    if (newUrl && !isDryRun) {
      await db.update(auctions).set({ logoUrl: newUrl }).where(eq(auctions.id, auction.id));
    }
  }
}

async function main() {
  console.log("Starting image migration to R2...");
  await migratePlayers(isDryRun);
  await migrateTeams(isDryRun);
  await migrateAuctions(isDryRun);
  console.log("Migration complete!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Fatal error during migration:", err);
  process.exit(1);
});
