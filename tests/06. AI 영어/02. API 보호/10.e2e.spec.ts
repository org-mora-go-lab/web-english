import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("내 계정이 소유하지 않은 음성 연결을 종료할 수 없다", async ({ page, baseURL }) => {
  await createAccount(page);
  const response = await page.request.delete(`/api/ai/realtime/${crypto.randomUUID()}`, { headers: { origin: baseURL! } });
  expect(response.status()).toBe(404);
});
