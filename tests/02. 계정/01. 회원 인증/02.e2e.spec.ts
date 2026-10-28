import { expect, test } from "@playwright/test";

import { createVerifiedAccount, login, waitForMail } from "../../__util__";

test("이메일 링크로 비밀번호를 재설정한다", async ({ page }) => {
  const { email } = await createVerifiedAccount(page);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/forgot-password");
  await page.getByLabel("이메일").fill(email);
  await page.getByRole("button", { name: "재설정 이메일 받기" }).click();
  await expect(page.getByRole("status")).toContainText("재설정 이메일");
  await page.goto(await waitForMail(email, "Mora English 비밀번호 재설정"));
  await page.getByLabel("비밀번호", { exact: true }).fill("NewSecurePassword123!");
  await page.getByLabel("비밀번호 확인").fill("NewSecurePassword123!");
  await page.getByRole("button", { name: "비밀번호 변경" }).click();
  await expect(page.getByRole("status")).toContainText("비밀번호가 변경");
  await login(page, email, "NewSecurePassword123!");
});
