import { expect, test } from "@playwright/test";

test("최근 레슨 유지", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /해외 카페.*레슨 열기/ }).click();
  await page.getByRole("button", { name: "레슨 닫기" }).click();
  await page.reload();
  await page.getByRole("button", { name: "최근 학습", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("해외 카페");
});
