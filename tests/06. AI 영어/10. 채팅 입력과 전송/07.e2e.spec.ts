import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("답변의 다음 질문에 답할 추천 문장을 전송한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  const sent: string[] = [];
  await page.route("**/api/ai/chat", async route => {
    sent.push(route.request().postDataJSON().messages.at(-1).content);
    await route.fulfill({ json: { reply: sent.length === 1 ? "What color is your ball?" : "Is it big or small?", replySuggestion: sent.length === 1 ? "It's red." : "It's a small ball.", model: "gpt-6-luna" } });
  });
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(input).toBeEmpty(); await expect(input).toHaveAttribute("placeholder", "It's red.");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(input).toHaveAttribute("placeholder", "It's a small ball.");
  expect(sent[1]).toBe("It's red.");
  await input.fill("It's a big blue ball.");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(3);
  expect(sent[2]).toBe("It's a big blue ball.");
});
