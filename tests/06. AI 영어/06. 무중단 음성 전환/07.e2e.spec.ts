import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedEndedVoice } from "../05. 음성 연결 연속성/__util__";

test("다른 계정의 저장 연결과 대기 연결을 제어할 수 없다", async ({ page, browser, baseURL }) => {
  const owner = await createAccount(page); const voice = await seedEndedVoice(owner.email);
  const context = await browser.newContext({ baseURL }); const other = await context.newPage();
  try {
    await createAccount(other);
    for (const [action, data] of [["observe", { previousObserverId: crypto.randomUUID() }], ["warm", { action: "context", revision: 0 }]] as const) {
      const response = await other.request.post(`/api/ai/realtime/${voice.continuationOf}/${action}`, { headers: { origin: baseURL! }, data });
      expect(response.status()).toBe(404);
    }
  } finally { await context.close(); }
});
