import { expect, test } from "@playwright/test";

test("완료 유지와 중복 방지", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "오늘의 학습 완료", exact: true })
    .click();
  await page.getByRole("button", { name: "학습 완료됨" }).click();
  await page.getByRole("button", { name: "레슨 닫기" }).click();
  await page.reload();
  await page.getByRole("button", { name: "완료한 레슨", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("스몰토크");
  await expect(page.getByText("1 / 8", { exact: true })).toBeVisible();
});
