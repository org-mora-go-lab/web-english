import { expect, test } from "@playwright/test";

test("저장 유지와 취소", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "어색한 침묵은 이제 그만, 스몰토크 시작하기 저장",
      exact: true,
    })
    .click();
  await page.reload();
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page
    .getByRole("button", { name: /스몰토크 시작하기 저장 취소/ })
    .click();
  await expect(page.getByRole("article")).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(
    page.getByRole("heading", { name: "아직 레슨이 없어요" }),
  ).toBeVisible();
});
