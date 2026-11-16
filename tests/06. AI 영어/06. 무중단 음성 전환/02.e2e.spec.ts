import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, type VoiceControls, voiceRtcEvent, voiceState } from "../04. 음성 대화/__mock__";

test("다음 WebRTC를 먼저 연결하고 현재 답변이 끝난 후 송신자를 옮긴다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await voiceRtcEvent(page, { type: "output_audio_buffer.started" });
  await page.evaluate(() => (window as unknown as { __voice: VoiceControls }).__voice.warm());
  await expect.poll(async () => (await voiceState(page)).starts).toBe(2);
  expect((await voiceState(page)).attachedSenders).toEqual([true, false]);
  expect((await voiceState(page)).closed).toBe(0); expect((await voiceState(page)).audioPauses).toBe(0);
  await voiceRtcEvent(page, { type: "output_audio_buffer.stopped" });
  await expect.poll(async () => (await voiceState(page)).closed).toBe(1);
  const switched = await voiceState(page);
  expect(switched.attachedSenders).toEqual([false, true]); expect(switched.microphones).toBe(1);
  expect(switched.enabledWrites).toEqual([false, true]); expect(switched.stopped).toBe(0);
  expect(switched.requests[1].continuationOf).toBe(switched.sessionIds[0]);
  expect(switched.warmActions.map(action => action.action)).toEqual(["context", "activate", "ready"]);
});
