import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, type VoiceControls, voiceEvent, voiceState } from "../04. 음성 대화/__mock__";

test("음성 연결을 같은 대화의 최신 문맥으로 자동 갱신한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const first = await voiceState(page);
  await voiceEvent(page, { kind: "saved", conversation: { id: first.requests[0].conversationId, revision: 11, mode: "parent", model: "gpt-realtime-2.1", title: "Animals", updatedAt: Date.now(), messages: [{ id: "u", role: "user", content: "I like cats." }, { id: "a", role: "assistant", content: "Cats are lovely." }] } });
  await voiceEvent(page, { kind: "renewing" });
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(false);
  // OpenAI hangs up the previous call before the next one is created.
  await page.evaluate(() => (window as unknown as { __voice: VoiceControls }).__voice.disconnect());
  await voiceEvent(page, { kind: "renew", sessionId: first.sessionIds[0] });
  await expect.poll(async () => (await voiceState(page)).starts).toBe(2);
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const renewed = await voiceState(page);
  expect(renewed.requests[1]).toMatchObject({ ...first.requests[0], revision: 11, continuationOf: first.sessionIds[0] });
  expect(renewed.microphones).toBe(1); expect(renewed.stopped).toBe(0);
  await expect(page.getByRole("button", { name: "고급 음성 종료", exact: true })).toBeVisible();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Cats are lovely.");
});
