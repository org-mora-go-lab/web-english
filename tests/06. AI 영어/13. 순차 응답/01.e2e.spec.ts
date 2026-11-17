import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { chatStreamState, mockChatStream, sendChatEvent } from "./__mock__";

test("답변 조각은 완료 전에 보이고 완료하면 한 번만 반영한다", async ({ page }) => {
  await mockChatStream(page); await mockAiModels(page); await createAccount(page);
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("동물 소리로 놀고 싶어요."); await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect.poll(async () => (await chatStreamState(page)).requests).toBe(1);
  await sendChatEvent(page, 0, { type: "delta", text: "고양이처럼 " });
  await expect(page.getByTestId("ai-message-streaming")).toContainText("고양이처럼");
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await sendChatEvent(page, 0, { type: "delta", text: "Meow! 해 볼까요?" });
  await expect(page.getByTestId("ai-message-streaming")).toContainText("고양이처럼 Meow! 해 볼까요?");
  await sendChatEvent(page, 0, { type: "complete", reply: "고양이처럼 Meow! 해 볼까요?", replySuggestion: "Meow! 귀여운 고양이네요.", model: "gpt-6-luna" }, true);
  await expect(page.getByTestId("ai-message-streaming")).toHaveCount(0);
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(1);
  await expect(input).toHaveAttribute("placeholder", "Meow! 귀여운 고양이네요.");
  await expect(input).toBeEmpty();
});
