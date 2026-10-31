import { expect, test } from "@playwright/test";
test("학습 완료 취소", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "오늘의 학습 완료", exact: true })
    .click();
  await page
    .getByRole("button", { name: "학습 완료 취소", exact: true })
    .click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await page.reload();
  await page.getByRole("button", { name: "완료한 레슨", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByRole("progressbar", { name: "학습 완료 진행률" }),
  ).toHaveAttribute("aria-valuenow", "0");
});
