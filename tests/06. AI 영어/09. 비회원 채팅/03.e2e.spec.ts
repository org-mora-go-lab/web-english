import { expect, test } from "@playwright/test";

test("비회원은 영상 주소로 직접 들어와도 로그인 안내만 본다", async ({ page }) => {
  await page.goto("/watch/momo-hello");
  await expect(page.getByRole("heading", { name: /로그인하고\s*영어 놀이를 시작해요/ })).toBeVisible();
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.getByRole("log", { name: "AI 대화" })).toHaveCount(0);
  await page.getByRole("link", { name: "로그인하고 대화하기" }).click();
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fwatch%2Fmomo-hello$/i);
});
