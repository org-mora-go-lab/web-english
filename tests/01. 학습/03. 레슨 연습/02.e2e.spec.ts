import { expect, test } from "@playwright/test";

test("키보드 닫기와 포커스 복원", async ({ page }) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "오늘의 레슨 시작하기" });
  await opener.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();
});
