import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedConversation } from "./__util__";

test("다른 창에서 변경된 이전 버전 요청은 대화를 덮어쓰지 않는다", async ({ page, baseURL }) => {
  const account = await createAccount(page); const saved = await seedConversation(account.email);
  const response = await page.request.post("/api/ai/chat", { headers: { origin: baseURL! }, data: { conversationId: saved.id, revision: 0, turnId: crypto.randomUUID(), model: "gpt-6-luna", mode: "parent", messages: [{ role: "user", content: "오래된 요청" }] } });
  expect(response.status()).toBe(409);
  expect((await (await page.request.get(`/api/ai/conversations/${saved.id}`)).json()).conversation.messages).toEqual(saved.messages);
});
