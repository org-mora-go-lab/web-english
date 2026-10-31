import { expect, test } from "@playwright/test";

test("최근 레슨 유지", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: /해외 카페.*레슨 열기/ }).click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await page.reload();
  await page.getByRole("button", { name: "최근 학습", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("해외 카페");
});
