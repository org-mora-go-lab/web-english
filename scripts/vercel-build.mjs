import { spawnSync } from "node:child_process";

function run(script) {
  const result = spawnSync("npm", ["run", script], { stdio: "inherit", env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.VERCEL_ENV === "production") {
  if (!process.env.TURSO_DATABASE_URL) throw new Error("Production Turso database is not configured");
  run("db:migrate");
}
run("build");
