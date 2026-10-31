import { expect, test } from "@playwright/test";
test("미완료 레슨 추천", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "오늘의 학습 완료", exact: true })
    .click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await expect(
    page.locator(".watch-primary").getByRole("heading", {
      name: "해외 카페에서 내 취향대로 주문하는 영어",
    }),
  ).toBeVisible();
});
