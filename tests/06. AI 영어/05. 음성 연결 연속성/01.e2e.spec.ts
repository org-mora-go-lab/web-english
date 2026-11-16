import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceState } from "../04. 음성 대화/__mock__";

test("음성 연결을 같은 대화의 최신 문맥으로 자동 갱신한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const first = await voiceState(page);
  await voiceEvent(page, { kind: "saved", conversation: { id: first.requests[0].conversationId, revision: 11, mode: "parent", model: "gpt-realtime-2.1", title: "Animals", updatedAt: Date.now(), messages: [{ id: "u", role: "user", content: "I like cats." }, { id: "a", role: "assistant", content: "Cats are lovely." }] } });
  await voiceEvent(page, { kind: "refresh", observerId: first.observerIds[0] });
  await expect.poll(async () => (await voiceState(page)).observerStarts).toBe(1);
  await expect.poll(async () => (await voiceState(page)).observerIds).toHaveLength(2);
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const renewed = await voiceState(page);
  expect(renewed.starts).toBe(1);
  expect(renewed.observerRequests[0]).toEqual({ previousObserverId: first.observerIds[0] });
  expect(renewed.closed).toBe(0); expect(renewed.audioPauses).toBe(0);
  expect(renewed.enabledWrites).toEqual([false, true]);
  expect(renewed.microphones).toBe(1); expect(renewed.stopped).toBe(0);
  await expect(page.getByRole("button", { name: "고급 음성 종료", exact: true })).toBeVisible();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Cats are lovely.");
});
