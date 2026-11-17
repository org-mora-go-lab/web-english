import { expect, test } from "@playwright/test";

test("비회원의 프로젝트 생성은 인증 오류로 거절한다", async ({ page, baseURL }) => {
  const response = await page.request.post("/api/ai/projects", { headers: { origin: baseURL! }, data: { name: "무단 프로젝트" } });
  expect(response.status()).toBe(401);
});
