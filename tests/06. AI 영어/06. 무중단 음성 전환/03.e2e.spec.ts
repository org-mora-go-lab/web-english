import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, type VoiceControls, voiceEvent, voiceState } from "../04. 음성 대화/__mock__";

test("준비 중 추가된 대화를 반영한 문맥으로만 전환한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const id = (await voiceState(page)).requests[0].conversationId;
  const saved = (revision: number) => ({ kind: "saved", conversation: { id, revision, mode: "parent", model: "gpt-realtime-2.1", title: "Practice", updatedAt: Date.now(), messages: [{ id: "u", role: "user", content: "I like cats." }, { id: "a", role: "assistant", content: "Cats are lovely." }] } });
  await voiceEvent(page, saved(1));
  await page.evaluate(() => { const voice = (window as unknown as { __voice: VoiceControls }).__voice; voice.holdWarm = true; voice.warm(); });
  await expect.poll(async () => (await voiceState(page)).warmActions).toContainEqual({ action: "context", revision: 1 });
  await voiceEvent(page, saved(2));
  await expect.poll(async () => (await voiceState(page)).warmActions).toContainEqual({ action: "context", revision: 2 });
  await page.evaluate(() => (window as unknown as { __voice: VoiceControls }).__voice.emitCall(1, { kind: "warm-ready", revision: 1 }));
  expect((await voiceState(page)).closed).toBe(0);
  await page.evaluate(() => (window as unknown as { __voice: VoiceControls }).__voice.emitCall(1, { kind: "warm-ready", revision: 2 }));
  await expect.poll(async () => (await voiceState(page)).closed).toBe(1);
  expect((await voiceState(page)).warmActions).toContainEqual({ action: "activate", revision: 2 });
  expect((await voiceState(page)).warmActions).not.toContainEqual({ action: "activate", revision: 1 });
});
