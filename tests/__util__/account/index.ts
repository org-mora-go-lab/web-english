import { randomUUID } from "node:crypto";

import { expect, type Page } from "@playwright/test";

export const defaultPassword = "SecurePassword123!";

export async function createAccount(page: Page) {
  const email = `mora-${randomUUID()}@example.test`;
  await page.goto("/signup");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("닉네임").fill("테스트 학습자");
  await page.getByLabel("비밀번호", { exact: true }).fill(defaultPassword);
  await page.getByLabel("비밀번호 확인").fill(defaultPassword);
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page).toHaveURL(/\/studio$/);
  return { email, password: defaultPassword };
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
}
