import "@tanstack/react-start/server-only";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import { relations as authRelations } from "./schema/auth.schema";
import { relations } from "./schema/relations";

// Required WebSocket constructor for Node.js environments.
// Edge runtimes with a native WebSocket global don't need this.
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle({
  client: pool,
  // authRelations uses defineRelationsPart,
  // so it must come after the main relations.
  // https://orm.drizzle.team/docs/relations-v2#relations-parts
  relations: { ...relations, ...authRelations },
});
