import { expect, test } from "@playwright/test";

test("존재하지 않는 영상", async ({ page }) => {
  const response = await page.goto("/watch/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByTestId("lesson-video")).toHaveCount(0);
});
