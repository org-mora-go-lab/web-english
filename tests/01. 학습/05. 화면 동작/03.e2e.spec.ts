import { expect, test } from "@playwright/test";
test("미완료 레슨 추천", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "오늘의 학습 완료", exact: true })
    .click();
  await page.getByRole("button", { name: "레슨 닫기" }).click();
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await expect(
    page.getByRole("dialog").getByRole("heading", {
      name: "해외 카페에서 내 취향대로 주문하는 영어",
    }),
  ).toBeVisible();
});
