import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "./__util__";

test("계정에 저장된 최신 대화를 다시 불러와 이어서 요청한다", async ({ page }) => {
  const account = await createAccount(page);
  const saved = await seedConversation(account.email);
  await mockAiModels(page);
  let input: { conversationId: string; revision: number; messages: unknown[] } | undefined;
  await page.route("**/api/ai/chat", async route => { input = route.request().postDataJSON(); await route.fulfill({ json: { reply: "Great job!", model: "gpt-6-luna" } }); });
  await page.goto("/ai");
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Roll the ball!");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "내 대화 내역" })).toHaveValue(saved.id);
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Roll the ball!");
  await page.getByRole("textbox", { name: "AI에게 보낼 메시지" }).fill("다음 표현도 알려줘");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  expect(input).toMatchObject({ conversationId: saved.id, revision: 1 });
  expect(input!.messages).toHaveLength(3);
});
