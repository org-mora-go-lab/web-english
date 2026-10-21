import { expect, test } from "@playwright/test";

test("모바일 메뉴", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "메뉴 열기/닫기" }).click();
  await page.getByRole("button", { name: "저장한 레슨", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "저장한 레슨", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "메뉴 열기/닫기" }),
  ).toHaveAttribute("aria-expanded", "false");
});
