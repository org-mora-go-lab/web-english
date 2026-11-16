import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("WebRTC를 지원하지 않는 브라우저는 텍스트 대화를 제공한다", async ({ page }) => {
  await page.addInitScript("window.RTCPeerConnection = undefined;");
  await createAccount(page); await mockAiModels(page);
  await page.route("**/api/ai/chat", route => route.fulfill({ json: { reply: "Hello!", model: "gpt-6-luna" } }));
  await page.goto("/ai");
  await expect(page.getByRole("button", { name: "고급 음성 시작", exact: true })).toBeDisabled();
  await page.getByRole("textbox", { name: "AI에게 보낼 메시지" }).fill("Hello");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Hello!");
});
