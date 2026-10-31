import { defineConfig, devices } from "@playwright/test";

const testEnv = {
  TURSO_DATABASE_URL: "file:./.tmp/e2e.sqlite",
  AUTH_SECRET: "e2e-test-only-secret-with-at-least-32-characters",
  AUTH_URL: "http://localhost:3200",
  AUTH_KAKAO_ID: "e2e-kakao-client-id",
  AUTH_KAKAO_SECRET: "e2e-kakao-client-secret",
};

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  workers: 2,
  timeout: 60_000,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "line",
  use: { baseURL: "http://localhost:3200", trace: "retain-on-failure" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    {
      name: "webkit-mobile",
      use: { ...devices["iPhone 13"] },
      testMatch: [
        "**/02. 계정/01. 회원 인증/01.e2e.spec.ts",
        "**/03. 콘텐츠/03. 모바일 편집/01.e2e.spec.ts",
        "**/04. 계정 학습/01. 학습 진도/01.e2e.spec.ts",
      ],
    },
  ],
  webServer: {
    command: "mkdir -p .tmp && npm run db:migrate && npm run dev",
    url: "http://localhost:3200",
    env: testEnv,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
