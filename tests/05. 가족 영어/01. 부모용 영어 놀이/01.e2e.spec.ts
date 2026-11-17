import { expect, test } from "@playwright/test";

test("첫 화면은 콘텐츠 패널에서 준비 단계와 화면 밖 놀이를 안내한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "야옹! 나랑 같이 놀자." })).toBeVisible();
  await expect(page.getByRole("button", {name: "고양이 야옹 소리 듣기"})).toBeVisible();
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeVisible();
  await page.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  await expect(page.getByRole("region", {name: "손 흔들며 인사 놀이 가이드"})).toContainText("아이가 따라 하지 않아도 괜찮아요.");
});
