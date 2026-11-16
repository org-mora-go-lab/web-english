import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("음성 제어 요청의 잘못된 JSON과 크기를 검증한다", async ({ page, baseURL }) => {
  await createAccount(page);
  for (const action of ["observe", "warm"]) {
    const url = `/api/ai/realtime/${crypto.randomUUID()}/${action}`;
    const malformed = await page.request.post(url, { headers: { origin: baseURL!, "content-type": "application/json" }, data: "{" });
    expect(malformed.status()).toBe(400);
    const oversized = await page.request.post(url, { headers: { origin: baseURL!, "content-type": "application/json" }, data: JSON.stringify({ padding: "x".repeat(1024) }) });
    expect(oversized.status()).toBe(413);
  }
});
