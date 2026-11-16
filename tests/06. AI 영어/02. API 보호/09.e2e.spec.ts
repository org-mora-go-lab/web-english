import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("API 키가 없으면 고급 음성 연결 전에 차단한다", async ({ page, baseURL }) => {
  await createAccount(page);
  const response = await page.request.post("/api/ai/realtime", { headers: { origin: baseURL! }, data: { sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n", conversationId: crypto.randomUUID(), revision: 0, mode: "practice", voice: "marin" } });
  expect(response.status()).toBe(503);
  expect(await response.json()).toMatchObject({ code: "NOT_CONFIGURED" });
});
