import { expect, test } from "@playwright/test";

test("새 동요 저장과 복원", async ({ page }) => {
  await page.goto("/watch/foxy-colors");
  await page.getByRole("button", { name: "레슨 저장", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "저장 취소", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: /^저장한 레슨/ }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("여우 Fifi");
});
