import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("입력 없이 보내기를 누르면 추천 질문을 전송한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  let sent = "";
  await page.route("**/api/ai/chat", async route => {
    sent = route.request().postDataJSON().messages.at(-1).content;
    await route.fulfill({ json: { reply: "Roll the ball!", model: "gpt-6-luna" } });
  });
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  const suggestion = await input.getAttribute("placeholder");
  await expect(input).toBeEmpty();
  await expect(page.getByRole("button", { name: "보내기", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Roll the ball!");
  expect(sent).toBe(suggestion);
  await expect(page.getByTestId("ai-message-user")).toContainText(suggestion!);
});
