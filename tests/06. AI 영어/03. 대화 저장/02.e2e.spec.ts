import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedConversation } from "./__util__";

test("다른 계정은 대화 목록과 조회 삭제 이어가기에 접근할 수 없다", async ({ page, browser, baseURL }) => {
  const first = await createAccount(page);
  const saved = await seedConversation(first.email);
  const other = await browser.newContext({ baseURL });
  try {
    const secondPage = await other.newPage(); await createAccount(secondPage);
    expect((await (await other.request.get("/api/ai/conversations")).json()).conversations).toEqual([]);
    expect((await other.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(404);
    expect((await other.request.delete(`/api/ai/conversations/${saved.id}`, { headers: { origin: baseURL! } })).status()).toBe(404);
    const response = await other.request.post("/api/ai/chat", { headers: { origin: baseURL! }, data: { conversationId: saved.id, revision: 1, turnId: crypto.randomUUID(), model: "gpt-6-luna", mode: "parent", messages: [{ role: "user", content: "Hello" }] } });
    expect(response.status()).toBe(404);
    expect((await page.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(200);
  } finally { await other.close(); }
});
