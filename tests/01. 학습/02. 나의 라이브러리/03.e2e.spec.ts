import { expect, test } from "@playwright/test";

test("학습 완료 유지", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "오늘의 학습 완료", exact: true })
    .click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await page.reload();
  await page.getByRole("button", { name: "완료한 레슨", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("스몰토크");
  await expect(page.getByText("1 / 25", { exact: true })).toBeVisible();
});
