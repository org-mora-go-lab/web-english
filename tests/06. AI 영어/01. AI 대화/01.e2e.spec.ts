import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { type AiRequest, mockAiModels } from "./__mock__";

test("선택한 모델로 대화하고 응답의 모델명을 표시한다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  let payload: AiRequest | undefined;
  await page.route("**/api/ai/chat", async (route) => {
    payload = route.request().postDataJSON() as AiRequest;
    await route.fulfill({ json: { reply: "Roll the ball! 공을 굴려 보세요.", model: payload.model } });
  });

  await page.goto("/ai");
  await expect(page.locator(".ai-chat-composer").getByRole("combobox", { name: "AI 모델" })).toBeVisible();
  await waitForChatControls(page);
  await page.getByRole("combobox", { name: "AI 모델" }).selectOption("gpt-6-sol");
  await page.getByRole("textbox", { name: "AI에게 보낼 메시지" }).fill("공으로 하는 영어 놀이를 알려줘");
  await page.getByRole("button", { name: "보내기", exact: true }).click();

  await expect(page.getByTestId("ai-message-assistant")).toContainText("Roll the ball!");
  await expect(page.getByTestId("ai-message-assistant")).toContainText("GPT-6 Sol");
  expect(payload).toEqual({
    conversationId: expect.any(String), revision: 0, turnId: expect.any(String),
    model: "gpt-6-sol",
    mode: "parent",
    messages: [{ role: "user", content: "공으로 하는 영어 놀이를 알려줘" }],
  });
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEmpty();
});
