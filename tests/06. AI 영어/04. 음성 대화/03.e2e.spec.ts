import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("음성을 지원하지 않는 브라우저에서도 텍스트 대화를 사용한다", async ({ page }) => {
  await page.addInitScript("window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;");
  await createAccount(page); await mockAiModels(page);
  await page.route("**/api/ai/chat", route => route.fulfill({ json: { reply: "Hello!", model: "gpt-6-luna" } }));
  await page.goto("/ai");
  await expect(page.getByRole("button", { name: "음성 대화 시작", exact: true })).toBeDisabled();
  await page.getByRole("textbox", { name: "AI에게 보낼 메시지" }).fill("Hello");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Hello!");
});
