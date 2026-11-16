import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("회원가입 직후 로그인하고 로그아웃한다", async ({ page }) => {
  await createAccount(page);
  await expect(page.getByRole("heading", { name: "야옹! 나랑 같이 놀자." })).toBeVisible();
  if (await page.getByRole("button", { name: "메뉴 열기" }).isVisible()) await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/settings/account");
  await expect(page).toHaveURL(/\/login/);
});
