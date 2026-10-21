import { expect, test } from "@playwright/test";
test("모든 레슨의 학습 콘텐츠", async ({ page }) => {
  test.setTimeout(60000);
  await page.goto("/");
  const cards = page.getByRole("button", { name: /레슨 열기$/ });
  await expect(cards).toHaveCount(15);
  for (let index = 0; index < 15; index++) {
    await cards.nth(index).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.locator(".practice-description")).not.toBeEmpty();
    await expect(dialog.getByText("이런 상황에서 써요")).toBeVisible();
    await expect(dialog.locator("ol > li")).toHaveCount(5);
    await expect(dialog.locator(".vocabulary > span")).toHaveCount(3);
    await expect(dialog.locator(".dialogue-line")).toHaveCount(4);
    await expect(dialog.locator(".practice-tip p")).not.toBeEmpty();
    await expect(
      dialog
        .getByRole("group", { name: "03. 이해도 확인" })
        .getByRole("button"),
    ).toHaveCount(3);
    await dialog.getByRole("button", { name: "레슨 닫기" }).click();
  }
});
