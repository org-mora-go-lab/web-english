import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function getDb() {
  if (!database) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error("TURSO_DATABASE_URL is required");
    const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
    database = drizzle(client, { schema });
  }
  return database;
}

export { schema };
