import { expect, test } from "@playwright/test";

test("비회원은 저장 연결 갱신과 대기 연결을 제어할 수 없다", async ({ request, baseURL }) => {
  for (const action of ["observe", "warm"]) {
    const response = await request.post(`/api/ai/realtime/${crypto.randomUUID()}/${action}`, { headers: { origin: baseURL! }, data: {} });
    expect(response.status()).toBe(401);
  }
});
