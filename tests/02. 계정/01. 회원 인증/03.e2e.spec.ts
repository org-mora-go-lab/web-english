import { expect, test } from "@playwright/test";

test("비회원의 계정 설정 및 쓰기 API 접근을 거부한다", async ({ page }) => {
  await page.goto("/settings/account");
  await expect(page).toHaveURL(/\/login/);
  const response = await page.evaluate(() => fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "무단 글" }) }).then((result) => result.status));
  expect(response).toBe(401);
});
