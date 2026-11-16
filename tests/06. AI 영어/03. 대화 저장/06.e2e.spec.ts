import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedConversation } from "./__util__";

test("회원 탈퇴는 저장된 AI 대화도 삭제한다", async ({ page, baseURL }) => {
  const account = await createAccount(page); const saved = await seedConversation(account.email);
  expect((await page.request.delete("/api/account", { headers: { origin: baseURL! }, data: { confirmation: "DELETE", password: account.password } })).status()).toBe(200);
  await createAccount(page);
  expect((await page.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(404);
});
