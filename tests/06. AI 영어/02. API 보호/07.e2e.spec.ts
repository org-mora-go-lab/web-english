import { expect, test } from "@playwright/test";

test("비회원의 고급 음성 시작과 종료 요청을 거절한다", async ({ request, baseURL }) => {
  const response = await request.post("/api/ai/realtime", { headers: { origin: baseURL! }, data: {} });
  expect(response.status()).toBe(401);
  expect(await response.json()).toMatchObject({ code: "AUTH_REQUIRED" });
  expect((await request.delete(`/api/ai/realtime/${crypto.randomUUID()}`, { headers: { origin: baseURL! } })).status()).toBe(401);
});
