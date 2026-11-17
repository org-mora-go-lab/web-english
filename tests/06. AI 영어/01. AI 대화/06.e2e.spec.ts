import { expect, test } from "@playwright/test";

import { createAccount, openChatOptions } from "../../__util__";
import { type AiRequest, mockAiModels } from "./__mock__";

test("영어 회화 모드로 바꾸면 이전 놀이 문맥을 초기화한다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  const requests: AiRequest[] = [];
  await page.route("**/api/ai/chat", async (route) => {
    const payload = route.request().postDataJSON() as AiRequest;
    requests.push(payload);
    await route.fulfill({ json: { reply: "Hello, friend!", model: payload.model } });
  });
  await page.goto("/ai");
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("부모용 놀이를 알려줘");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await openChatOptions(page);
  await page.getByRole("button", { name: "영어 회화 연습", exact: true }).click();
  await openChatOptions(page);
  await expect(page.getByRole("button", { name: "영어 회화 연습", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await input.fill("Hello!");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  expect(requests[1].mode).toBe("practice");
  expect(requests[1].messages).toEqual([{ role: "user", content: "Hello!" }]);
});
