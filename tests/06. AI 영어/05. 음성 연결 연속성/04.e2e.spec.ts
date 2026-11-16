import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "../04. 음성 대화/__mock__";
import { seedLongVoiceConversation } from "./__util__";

test("100회 이후에도 음성 대화를 시작할 수 있다", async ({ page, baseURL }) => {
  await mockVoice(page); const account = await createAccount(page); await mockAiModels(page);
  await seedLongVoiceConversation(account.email);
  await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  expect((await voiceState(page)).requests[0].revision).toBe(101);
  // The real API accepts the revision; the local test intentionally has no API key.
  const response = await page.request.post("/api/ai/realtime", { headers: { origin: baseURL! }, data: (await voiceState(page)).requests[0] });
  expect(response.status()).toBe(503);
});
