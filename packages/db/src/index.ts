import "@tanstack/react-start/server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { relations as authRelations } from "./schema/auth.schema";
import { relations } from "./schema/relations";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({
  client: sql,
  // authRelations uses defineRelationsPart,
  // so it must come after the main relations.
  // https://orm.drizzle.team/docs/relations-v2#relations-parts
  relations: { ...relations, ...authRelations },
});
