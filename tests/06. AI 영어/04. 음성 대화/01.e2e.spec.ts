import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { type AiRequest, mockAiModels } from "../01. AI 대화/__mock__";
import { finishSpeaking, mockVoice, say, voiceStarts } from "./__mock__";

test("음성을 전송하고 답변을 읽은 뒤 다음 음성 대화를 이어간다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page);
  const requests: AiRequest[] = [];
  await page.route("**/api/ai/chat", async route => { requests.push(route.request().postDataJSON()); await route.fulfill({ json: { reply: "Hello, how are you?", model: "gpt-6-luna" } }); });
  await page.goto("/ai");
  await page.getByRole("button", { name: "영어 회화 연습", exact: true }).click();
  await page.getByRole("button", { name: "음성 대화 시작", exact: true }).click();
  await say(page, "Hello, I am happy.");
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __voice: { spoken: string[] } }).__voice.spoken)).toEqual(["Hello, how are you?"]);
  await finishSpeaking(page);
  await expect.poll(() => voiceStarts(page)).toBe(2);
  await say(page, "How about you?");
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  expect(requests[1].messages).toEqual([{ role: "user", content: "Hello, I am happy." }, { role: "assistant", content: "Hello, how are you?" }, { role: "user", content: "How about you?" }]);
  await page.getByRole("button", { name: "음성 대화 종료", exact: true }).click();
  await expect(page.getByRole("button", { name: "음성 대화 시작", exact: true })).toHaveAttribute("aria-pressed", "false");
});
