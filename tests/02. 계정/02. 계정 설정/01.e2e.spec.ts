import { expect, test } from "@playwright/test";

import { createAccount, login } from "../../__util__";

test("현재 비밀번호를 확인한 뒤 닉네임과 로그인 이메일을 변경한다", async ({ page }) => {
  const { password } = await createAccount(page);
  const email = `changed-${Date.now()}@example.test`;
  await page.goto("/settings/account");
  await page.getByLabel("닉네임").fill("새 닉네임");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("저장했습니다");
  await page.getByLabel("새 이메일").fill(email);
  await page.getByLabel("이메일 변경 확인 비밀번호").fill(password);
  await page.getByRole("button", { name: "이메일 변경" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await login(page, email, password);
  await expect(page.getByRole("heading", { name: "새 닉네임님의 스튜디오" })).toBeVisible();
});
