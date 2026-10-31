import { expect, test } from "@playwright/test";
test("레슨 내부 저장과 카드 반영", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .locator(".watch-primary")
    .getByRole("button", { name: "레슨 저장", exact: true })
    .click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await expect(
    page.getByRole("button", { name: /스몰토크 시작하기 저장 취소/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: /스몰토크.*레슨 열기/ }).click();
  await page
    .locator(".watch-primary")
    .getByRole("button", { name: "저장 취소", exact: true })
    .click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await page.getByRole("button", { name: "저장한 레슨", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(0);
});
