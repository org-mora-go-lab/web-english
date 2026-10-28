import { expect, test } from "@playwright/test";

import { createVerifiedAccount, login } from "../../__util__";

test("비밀번호 변경 뒤 다른 브라우저 세션을 무효화한다", async ({ browser, page }) => {
  const { email, password } = await createVerifiedAccount(page);
  const other = await browser.newPage();
  await login(other, email, password);
  await page.goto("/settings/account");
  await page.getByLabel("현재 비밀번호").fill(password);
  await page.getByLabel("새 비밀번호").fill("ChangedPassword123!");
  await page.getByRole("button", { name: "비밀번호 변경" }).click();
  await expect(page).toHaveURL(/\/login/);
  const status = await other.evaluate(() => fetch("/api/account").then(response => response.status));
  expect(status).toBe(401);
  await other.close();
});
