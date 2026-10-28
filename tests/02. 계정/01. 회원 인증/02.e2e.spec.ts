import { expect, test } from "@playwright/test";

import { createAccount, defaultPassword, login } from "../../__util__";

test("중복 가입은 기존 비밀번호를 바꾸지 않는다", async ({ page }) => {
  const { email } = await createAccount(page);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await page.goto("/signup");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("닉네임").fill("다른 학습자");
  await page.getByLabel("비밀번호", { exact: true }).fill("OtherPassword123!");
  await page.getByLabel("비밀번호 확인").fill("OtherPassword123!");
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByText("가입을 완료할 수 없습니다", { exact: false })).toBeVisible();
  await login(page, email, defaultPassword);
  await expect(page.getByRole("heading", { name: "테스트 학습자님의 스튜디오" })).toBeVisible();
});
