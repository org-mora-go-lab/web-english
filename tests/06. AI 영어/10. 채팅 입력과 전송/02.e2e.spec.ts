import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("직접 입력한 문장이 추천 질문보다 우선한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  let sent = "";
  await page.route("**/api/ai/chat", async route => {
    sent = route.request().postDataJSON().messages.at(-1).content;
    await route.fulfill({ json: { reply: "Let's play with a teddy bear!", model: "gpt-6-luna" } });
  });
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  await input.fill("곰 인형으로 할 수 있는 놀이를 알려주세요.");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  expect(sent).toBe("곰 인형으로 할 수 있는 놀이를 알려주세요.");
  await expect(input).toBeEmpty();
});
