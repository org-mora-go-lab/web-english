import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("이메일 인증 후 로그인과 로그아웃", async ({ page }) => {
  await createVerifiedAccount(page);
  await expect(page.getByRole("heading", { name: /스튜디오/ })).toBeVisible();
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/studio");
  await expect(page).toHaveURL(/\/login/);
});
