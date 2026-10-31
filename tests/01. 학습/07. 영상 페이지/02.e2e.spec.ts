import { expect, test } from "@playwright/test";

test("카드에서 별도 시청 페이지", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: /스몰토크.*레슨 열기/ }).click();
  await expect(page).toHaveURL("/watch/small-talk");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("스몰토크");
  await expect(page.getByTestId("lesson-video")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
