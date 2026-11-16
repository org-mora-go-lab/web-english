import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { type AiRequest, mockAiModels } from "./__mock__";

test("응답 오류 후 입력을 보존하고 중복 없이 재시도한다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  const requests: AiRequest[] = [];
  await page.route("**/api/ai/chat", async (route) => {
    requests.push(route.request().postDataJSON() as AiRequest);
    await route.fulfill(requests.length === 1
      ? { status: 502, json: { error: "잠시 후 다시 시도해주세요.", code: "UPSTREAM_ERROR" } }
      : { json: { reply: "Hello, little bear!", model: requests[1].model } });
  });
  await page.goto("/ai");
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("곰 인형에게 영어로 인사해줘");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByRole("button", { name: "다시 보내기" })).toBeVisible();
  await expect(input).toHaveValue("곰 인형에게 영어로 인사해줘");
  await page.getByRole("button", { name: "다시 보내기" }).click();

  await expect(page.getByTestId("ai-message-assistant")).toContainText("Hello, little bear!");
  await expect(page.getByTestId("ai-message-user")).toHaveCount(1);
  expect(requests).toHaveLength(2);
  expect(requests[1]).toEqual(requests[0]);
});
