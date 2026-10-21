import { expect, test } from "@playwright/test";

test("문장 해석 표시", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  const dialog = page.locator(".watch-primary");
  await expect(
    dialog.getByText("How has your day been?", { exact: true }),
  ).toBeVisible();
  await expect(
    dialog.getByText("오늘 하루 어땠어요?", { exact: true }),
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "해석 보기", exact: true }).click();
  await expect(
    dialog.getByText("오늘 하루 어땠어요?", { exact: true }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "해석 숨기기", exact: true })
    .click();
  await expect(
    dialog.getByText("오늘 하루 어땠어요?", { exact: true }),
  ).toHaveCount(0);
});
