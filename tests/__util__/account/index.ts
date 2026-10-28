import { randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import { expect, type Page } from "@playwright/test";

export const defaultPassword = "SecurePassword123!";

export async function waitForMail(email: string, subject: string) {
  const directory = join(process.cwd(), ".tmp/test-mail");
  for (let attempt = 0; attempt < 30; attempt++) {
    const names = await readdir(directory).catch(() => []);
    for (const name of names) {
      const mail = JSON.parse(await readFile(join(directory, name), "utf8")) as { to: string; subject: string; url: string };
      if (mail.to === email && mail.subject === subject) return mail.url;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`No test email for ${email}`);
}

export async function createVerifiedAccount(page: Page) {
  const email = `mora-${randomUUID()}@example.test`;
  await page.goto("/signup");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("닉네임").fill("테스트 학습자");
  await page.getByLabel("비밀번호", { exact: true }).fill(defaultPassword);
  await page.getByLabel("비밀번호 확인").fill(defaultPassword);
  await page.getByRole("button", { name: "가입하기" }).click();
  await expect(page.getByRole("status")).toContainText("인증 이메일");
  const url = await waitForMail(email, "Mora English 이메일 인증");
  await page.goto(url);
  await expect(page.getByRole("status")).toContainText("인증이 완료");
  await login(page, email, defaultPassword);
  return { email, password: defaultPassword };
}

export async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("이메일").fill(email);
  await page.getByLabel("비밀번호").fill(password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/studio$/);
}
