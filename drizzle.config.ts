import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: ".env.local" });

const databaseUrl = process.env.TURSO_DATABASE_URL;
if (!databaseUrl) throw new Error("TURSO_DATABASE_URL is required for migrations");

export default defineConfig({
  schema: "./src/5-shared/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: databaseUrl,
    // Drizzle Kit requires a nonempty token even though file-backed libsql ignores it.
    authToken: process.env.TURSO_AUTH_TOKEN || (databaseUrl.startsWith("file:") ? "local-file-unused-token" : undefined),
  },
});
