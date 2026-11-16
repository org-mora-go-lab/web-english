import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("허용 목록 밖의 AI 모델을 거절한다", async ({ page }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/chat", {
    headers: { origin: new URL(page.url()).origin },
    data: { model: "unapproved-model", mode: "parent", messages: [{ role: "user", content: "Hello" }] },
  });
  expect(response.status()).toBe(400);
  expect(await response.json()).toMatchObject({ code: "MODEL_NOT_ALLOWED" });
});
