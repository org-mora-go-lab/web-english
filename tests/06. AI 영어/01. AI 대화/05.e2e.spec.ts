import { expect, test } from "@playwright/test";

import { createAccount, openChatOptions } from "../../__util__";
import { type AiRequest, mockAiModels } from "./__mock__";

test("새 대화의 요청에는 이전 대화를 포함하지 않는다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  const requests: AiRequest[] = [];
  await page.route("**/api/ai/chat", async (route) => {
    const payload = route.request().postDataJSON() as AiRequest;
    requests.push(payload);
    await route.fulfill({ json: { reply: "Let's play!", model: payload.model } });
  });
  await page.goto("/ai");
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("첫 번째 놀이");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await openChatOptions(page);
  await page.getByRole("button", { name: "새 대화", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await input.fill("새로운 놀이");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  expect(requests[1].messages).toEqual([{ role: "user", content: "새로운 놀이" }]);
});
