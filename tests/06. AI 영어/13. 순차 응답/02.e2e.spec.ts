import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { chatStreamState, mockChatStream, sendChatEvent } from "./__mock__";

test("생성 중지 뒤 이전 스트림 조각은 새 답변에 추가하지 않는다", async ({ page }) => {
  await mockChatStream(page); await mockAiModels(page); await createAccount(page);
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("첫 질문"); await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect.poll(async () => (await chatStreamState(page)).requests).toBe(1);
  await sendChatEvent(page, 0, { type: "delta", text: "취소할 답변" });
  await expect(page.getByTestId("ai-message-streaming")).toBeVisible();
  await page.getByRole("button", { name: "응답 중지", exact: true }).click();
  await expect(input).toHaveValue("첫 질문"); await expect(page.getByTestId("ai-message-streaming")).toHaveCount(0);
  await input.fill("새 질문"); await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect.poll(async () => (await chatStreamState(page)).requests).toBe(2);
  await sendChatEvent(page, 0, { type: "complete", reply: "취소한 늦은 답변", model: "gpt-6-luna" }, true);
  await sendChatEvent(page, 1, { type: "complete", reply: "새 답변", replySuggestion: "다음 놀이도 알려 주세요.", model: "gpt-6-luna" }, true);
  await expect(page.getByTestId("ai-message-assistant")).toHaveText(/새 답변/);
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(1);
  await expect(page.getByRole("log", { name: "AI 대화" })).not.toContainText("취소한 늦은 답변");
});
