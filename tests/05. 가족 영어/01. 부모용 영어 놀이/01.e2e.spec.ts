import { expect, test } from "@playwright/test";

test("첫 화면은 준비 단계와 화면 밖 놀이를 안내한다", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /하루 한 장/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: "현재 개월수" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "이번 개월수의 놀이 카드" })).toBeVisible();
  await expect(page.getByText("16–17개월", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  await expect(page.getByRole("dialog")).toContainText("아이가 따라 하지 않아도 괜찮아요.");
});
