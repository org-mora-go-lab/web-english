import { expect, test } from "@playwright/test";

test("모바일 시청 페이지", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/watch/coffee");
  await expect(page.getByTestId("lesson-video")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await expect(page).toHaveURL("/library");
});
