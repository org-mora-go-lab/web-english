import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedEndedVoice } from "./__util__";

test("직접 종료한 연결을 자동 갱신에 재사용할 수 없다", async ({ page, baseURL }) => {
  const owner = await createAccount(page); const input = await seedEndedVoice(owner.email);
  const response = await page.request.post("/api/ai/realtime", { headers: { origin: baseURL! }, data: input });
  expect(response.status()).toBe(409); expect(await response.json()).toMatchObject({ code: "VOICE_RENEWAL_INVALID" });
});
