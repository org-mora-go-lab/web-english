import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "./__mock__";

test("비회원이 로그인한 뒤 AI 대화 화면으로 복귀한다", async ({ page }) => {
  const account = await createAccount(page);
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  await mockAiModels(page);
  const aiRequests: string[] = [];
  page.on("request", request => { if (request.url().includes("/api/ai/")) aiRequests.push(request.url()); });
  await page.goto("/ai");
  await expect(page.getByRole("heading", { name: /로그인하고\s*영어 놀이를 시작해요/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toHaveCount(0);
  await expect(page.getByRole("combobox", { name: "AI 모델" })).toHaveCount(0);
  expect(aiRequests).toHaveLength(0);
  await page.getByRole("link", { name: "로그인하고 대화하기", exact: true }).click();
  await expect(page).toHaveURL(/\/login\?callbackUrl=(?:\/ai|%2Fai)$/i);
  await page.getByLabel("이메일").fill(account.email);
  await page.getByLabel("비밀번호", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
  await expect(page.getByRole("link", { name: "로그인하고 대화하기", exact: true })).toHaveCount(0);
});
