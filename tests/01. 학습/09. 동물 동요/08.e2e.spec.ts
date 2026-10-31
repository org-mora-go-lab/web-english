import { expect, test } from "@playwright/test";

test("모바일 동요 탐색과 시청", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/library");
  await expect(page.getByTestId("momo-video")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("link", { name: /거북이 Toto.*동요 보기$/ }).click();
  await expect(page).toHaveURL("/watch/toto-slow-fast");
  await expect(page.getByTestId("lesson-video")).toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
