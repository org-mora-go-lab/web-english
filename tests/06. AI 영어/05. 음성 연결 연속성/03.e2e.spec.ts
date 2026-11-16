import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, type VoiceControls, voiceEvent, voiceState } from "../04. 음성 대화/__mock__";

test("갱신 중 종료하면 마이크를 해제하고 재연결하지 않는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const first = await voiceState(page);
  await page.evaluate(() => { (window as unknown as { __voice: VoiceControls }).__voice.holdRenewal = true; });
  await voiceEvent(page, { kind: "renewing" });
  await voiceEvent(page, { kind: "renew", sessionId: first.sessionIds[0] });
  await expect.poll(async () => (await voiceState(page)).starts).toBe(2);
  await page.getByRole("button", { name: "고급 음성 종료", exact: true }).click();
  await expect(page.getByRole("button", { name: "고급 음성 시작", exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
  const stopped = await voiceState(page);
  expect(stopped.stopped).toBe(1); expect(stopped.closed).toBe(2); expect(stopped.microphones).toBe(1);
  await voiceEvent(page, { kind: "user", text: "late renewal" });
  await expect(page.getByTestId("ai-message-pending")).toHaveCount(0);
  expect((await voiceState(page)).starts).toBe(2);
});
