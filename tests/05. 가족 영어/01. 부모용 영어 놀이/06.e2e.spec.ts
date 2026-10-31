import { expect, test } from "@playwright/test";

test("스마트폰 화면에서 메뉴와 놀이 카드를 사용할 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "부모 가이드", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /손 흔들며 인사/ })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
