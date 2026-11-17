import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("키보드로 목록 복귀", async ({ page }) => {
  await createAccount(page);
  await page.goto("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  const back = page.getByRole("link", { name: "목록으로 돌아가기" });
  await back.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/library");
  await expect(page.getByRole("article")).toHaveCount(15);
});
