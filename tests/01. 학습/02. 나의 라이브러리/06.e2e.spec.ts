import { expect, test } from "@playwright/test";
test("여러 창의 기록 동기화", async ({ page, context }) => {
  await page.goto("/library");
  const other = await context.newPage();
  await other.goto("/library");
  await page.getByRole("button", { name: "저장한 레슨", exact: true }).click();
  await other
    .getByRole("button", {
      name: "어색한 침묵은 이제 그만, 스몰토크 시작하기 저장",
      exact: true,
    })
    .click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await other
    .getByRole("button", { name: /스몰토크 시작하기 저장 취소/ })
    .click();
  await expect(page.getByRole("article")).toHaveCount(0);
});
