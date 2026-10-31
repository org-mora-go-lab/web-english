import { expect, test } from "@playwright/test";

test("시청 페이지에서 홈 인사 영상 해제", async ({ page }) => {
  await page.goto("/library");
  await expect(page.getByTestId("momo-video")).toBeVisible();
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await expect(page.getByTestId("momo-video")).toHaveCount(0);
  await expect(page.getByTestId("lesson-video")).toBeVisible();
});
