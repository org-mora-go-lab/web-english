import { expect, test } from "@playwright/test";
test("최근 학습 순서와 중복 제거", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /스몰토크.*레슨 열기/ }).click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: /해외 카페.*레슨 열기/ }).click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("link", { name: /스몰토크.*레슨 열기/ }).click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await page.getByRole("button", { name: "최근 학습", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("article").first()).toContainText("스몰토크");
});
