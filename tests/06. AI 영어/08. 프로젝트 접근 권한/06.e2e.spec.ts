import { expect, test } from "@playwright/test";

test("비회원의 프로젝트 목록 조회는 인증 오류로 거절한다", async ({ page }) => {
  expect((await page.request.get("/api/ai/projects")).status()).toBe(401);
});
