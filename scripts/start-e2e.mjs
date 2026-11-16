import { spawn, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

// Use the npm CLI that launched Playwright on Windows and Linux alike.
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run E2E through npm run test:e2e.");
mkdirSync(".tmp", { recursive: true });
for (const script of ["db:migrate", "build"]) {
  const result = spawnSync(process.execPath, [npmCli, "run", script], { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn(process.execPath, [npmCli, "run", "start"], { stdio: "inherit" });
server.on("exit", code => process.exit(code ?? 1));
