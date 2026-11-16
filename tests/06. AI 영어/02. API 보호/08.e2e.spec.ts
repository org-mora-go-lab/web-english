import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("고급 음성의 외부 출처 요청을 거절한다", async ({ page }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/realtime", { headers: { origin: "https://other.example" }, data: {} });
  expect(response.status()).toBe(403);
});
