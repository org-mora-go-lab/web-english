import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

import { createClient } from "@libsql/client";

// Use the npm CLI that launched Playwright on Windows and Linux alike.
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run E2E through npm run test:e2e.");
mkdirSync(".tmp", { recursive: true });
const url = process.env.TURSO_DATABASE_URL;
if (!url?.startsWith("file:")) throw new Error("E2E requires an isolated local SQLite database.");
const database = createClient({ url, timeout: 5000 });
try { await database.execute("PRAGMA journal_mode = WAL"); }
finally { database.close(); }
for (const script of ["db:migrate", "build"]) {
  const result = spawnSync(process.execPath, [npmCli, "run", script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn(process.execPath, [npmCli, "run", "start"], { stdio: "inherit" });
server.on("exit", code => process.exit(code ?? 1));
