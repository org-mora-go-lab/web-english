import { expect, test } from "@playwright/test";

test("비회원의 AI 대화 요청은 인증 오류로 거절한다", async ({ request, baseURL }) => {
  const response = await request.post("/api/ai/chat", {
    headers: { origin: new URL(baseURL!).origin },
    data: { model: "gpt-6-luna", mode: "parent", messages: [{ role: "user", content: "Hello" }] },
  });
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ code: "AUTH_REQUIRED" });
});
