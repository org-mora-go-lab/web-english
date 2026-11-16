import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceRtcEvent, voiceState } from "../04. 음성 대화/__mock__";

test("AI 재생 중 저장 연결 갱신은 오디오와 입력을 중단하지 않는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await voiceRtcEvent(page, { type: "output_audio_buffer.started" });
  await voiceEvent(page, { kind: "speaking" });
  const before = await voiceState(page);
  await voiceEvent(page, { kind: "refresh", observerId: before.observerIds[0] });
  await expect.poll(async () => (await voiceState(page)).observerStarts).toBe(1);
  await voiceEvent(page, { kind: "user", text: "Continue, please." });
  await expect(page.getByTestId("ai-message-pending")).toContainText("Continue, please.");
  await voiceEvent(page, { kind: "saved", conversation: { id: before.requests[0].conversationId, revision: 1, mode: "parent", model: "gpt-realtime-2.1", title: "Continue", updatedAt: Date.now(), messages: [{ id: "u", role: "user", content: "Continue, please." }, { id: "a", role: "assistant", content: "Let's keep talking." }] } });
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Let's keep talking.");
  const after = await voiceState(page);
  expect(after.enabled).toBe(true); expect(after.enabledWrites).toEqual(before.enabledWrites);
  expect(after.closed).toBe(0); expect(after.audioPauses).toBe(0); expect(after.starts).toBe(1);
  await expect(page.getByText("AI가 말하고 있어요. 말씀하시면 멈춰 들어요.", { exact: true })).toBeVisible();
});
