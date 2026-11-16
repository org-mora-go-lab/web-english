import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedEndedVoice } from "./__util__";

test("다른 계정의 연결로 갱신할 수 없다", async ({ page, baseURL, browser }) => {
  const owner = await createAccount(page); const input = await seedEndedVoice(owner.email, true);
  const other = await browser.newContext({ baseURL }); const otherPage = await other.newPage();
  try {
    await createAccount(otherPage);
    const response = await otherPage.request.post(`${baseURL}/api/ai/realtime`, { headers: { origin: baseURL! }, data: input });
    expect(response.status()).toBe(404);
  } finally { await other.close(); }
});
