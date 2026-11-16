import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedEndedVoice } from "./__util__";

test("이미 사용한 갱신 연결은 다시 사용할 수 없다", async ({ page, baseURL }) => {
  const owner = await createAccount(page); const input = await seedEndedVoice(owner.email, true, true);
  const response = await page.request.post("/api/ai/realtime", { headers: { origin: baseURL! }, data: input });
  expect(response.status()).toBe(409); expect(await response.json()).toMatchObject({ code: "VOICE_RENEWAL_INVALID" });
});
