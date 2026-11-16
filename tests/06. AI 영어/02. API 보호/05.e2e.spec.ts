import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("API 키가 없으면 외부 호출 없이 설정 필요 응답을 반환한다", async ({ page }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/chat", {
    headers: { origin: new URL(page.url()).origin },
    data: { model: "gpt-6-luna", mode: "parent", messages: [{ role: "user", content: "Hello" }] },
  });
  expect(response.status()).toBe(503);
  const body = await response.json();
  expect(body).toEqual({ error: expect.any(String), code: "NOT_CONFIGURED" });
});
