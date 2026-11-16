import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("외부 출처는 저장 연결 갱신과 대기 연결을 제어할 수 없다", async ({ page }) => {
  await createAccount(page);
  for (const action of ["observe", "warm"]) {
    const response = await page.request.post(`/api/ai/realtime/${crypto.randomUUID()}/${action}`, { headers: { origin: "https://invalid.example" }, data: {} });
    expect(response.status()).toBe(403);
  }
});
