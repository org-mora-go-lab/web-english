import { defineConfig, devices } from "@playwright/test";

const testEnv = {
  TURSO_DATABASE_URL: "file:./.tmp/e2e.sqlite",
  AUTH_SECRET: "e2e-test-only-secret-with-at-least-32-characters",
  AUTH_URL: "http://localhost:3200",
  EMAIL_CAPTURE_DIR: ".tmp/test-mail",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: { baseURL: "http://localhost:3200", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "mkdir -p .tmp && npm run db:migrate && npm run dev",
    url: "http://localhost:3200",
    env: testEnv,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
