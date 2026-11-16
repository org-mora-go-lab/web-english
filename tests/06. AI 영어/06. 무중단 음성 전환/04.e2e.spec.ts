import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, type VoiceControls, voiceState } from "../04. 음성 대화/__mock__";

test("대기 음성 연결 준비 중 종료하면 두 연결을 모두 해제한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.evaluate(() => { const voice = (window as unknown as { __voice: VoiceControls }).__voice; voice.holdWarm = true; voice.warm(); });
  await expect.poll(async () => (await voiceState(page)).sessionIds).toHaveLength(2);
  await page.getByRole("button", { name: "고급 음성 종료", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).deletes).toBe(2);
  expect((await voiceState(page)).closed).toBe(2); expect((await voiceState(page)).stopped).toBe(1);
  await page.evaluate(() => (window as unknown as { __voice: VoiceControls }).__voice.emitCall(1, { kind: "warm-ready", revision: 0 }));
  await expect(page.getByRole("button", { name: "고급 음성 시작", exact: true })).toBeVisible();
  expect((await voiceState(page)).starts).toBe(2);
});
