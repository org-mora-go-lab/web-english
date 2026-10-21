import { expect, test } from "@playwright/test";
test("데스크톱 메뉴 토글", async ({ page }) => {
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "메뉴 열기/닫기" });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("navigation", { name: "주 메뉴" }),
  ).not.toBeInViewport();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(
    page.getByRole("navigation", { name: "주 메뉴" }),
  ).toBeInViewport();
});
