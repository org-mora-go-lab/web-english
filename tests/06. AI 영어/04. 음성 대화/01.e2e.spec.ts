import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceState } from "./__mock__";

test("고급 음성 연결에서 서버가 저장한 전사문과 답변을 표시한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page);
  await page.goto("/ai");
  await waitForChatControls(page);
  await page.getByRole("button", { name: "영어 회화 연습", exact: true }).click();
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  const input = (await voiceState(page)).requests[0];
  expect(input).toMatchObject({ mode: "practice", voice: "marin", revision: 0 });
  await voiceEvent(page, { kind: "user", text: "How are you?" });
  await expect(page.getByTestId("ai-message-pending")).toContainText("How are you?");
  await voiceEvent(page, { kind: "saved", conversation: { id: input.conversationId, title: "How are you?", mode: "practice", model: "gpt-realtime-2.1", revision: 1, updatedAt: Date.now(), messages: [{ id: "user-1", role: "user", content: "How are you?" }, { id: "assistant-1", role: "assistant", content: "I'm well. How about you?", model: "gpt-realtime-2.1" }] } });
  await expect(page.getByTestId("ai-message-assistant")).toContainText("GPT Realtime 2.1");
  await expect(page.getByTestId("ai-message-assistant")).toContainText("I'm well.");
  await expect(page.getByTestId("ai-message-pending")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeDisabled();
  await page.getByRole("button", { name: "고급 음성 종료", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
});
