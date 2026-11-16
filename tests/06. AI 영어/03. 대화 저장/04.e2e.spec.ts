import { expect, test } from "@playwright/test";

test("비회원의 대화 내역 조회와 삭제를 거절한다", async ({ request, baseURL }) => {
  expect((await request.get("/api/ai/conversations")).status()).toBe(401);
  const id = crypto.randomUUID();
  expect((await request.get(`/api/ai/conversations/${id}`)).status()).toBe(401);
  expect((await request.delete(`/api/ai/conversations/${id}`, { headers: { origin: baseURL! } })).status()).toBe(401);
});
