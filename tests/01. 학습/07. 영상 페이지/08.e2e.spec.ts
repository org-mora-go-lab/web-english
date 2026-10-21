import { expect, test } from "@playwright/test";

test("뒤로가기 목록 스크롤 복원", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await page.goto("/");
  const card = page.getByRole("link", { name: /레슨 열기$/ }).last();
  await card.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => scrollY);
  expect(before).toBeGreaterThan(300);
  await card.click();
  await expect(page).toHaveURL(/\/watch\//);
  await page.goBack();
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before - 120);
});
