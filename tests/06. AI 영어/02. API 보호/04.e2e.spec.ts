import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("다른 출처에서 보낸 AI 대화 요청을 거절한다", async ({ page }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/chat", {
    headers: { origin: "https://external.example.test" },
    data: { model: "gpt-6-luna", mode: "parent", messages: [{ role: "user", content: "Hello" }] },
  });
  expect(response.status()).toBe(403);
  expect(await response.json()).toMatchObject({ code: "INVALID_ORIGIN" });
});
