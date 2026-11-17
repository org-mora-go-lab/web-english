import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { type AiRequest, mockAiModels } from "./__mock__";

test("응답 중지 후 늦게 도착한 응답을 대화에 추가하지 않는다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  let releaseFirst!: () => void;
  let finishFirst!: () => void;
  const heldResponse = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const firstFinished = new Promise<void>((resolve) => { finishFirst = resolve; });
  let count = 0;
  await page.route("**/api/ai/chat", async (route) => {
    count += 1;
    const payload = route.request().postDataJSON() as AiRequest;
    if (count === 1) {
      await heldResponse;
      await route.fulfill({ json: { reply: "취소된 오래된 응답", model: payload.model } }).catch(() => {});
      finishFirst();
      return;
    }
    await route.fulfill({ json: { reply: "새로운 영어 놀이 응답", model: payload.model } });
  });
  await page.goto("/ai");
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("오래 걸리는 질문");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect.poll(() => count).toBe(1);
  const stop = page.getByRole("button", { name: "응답 중지", exact: true });
  await expect(stop).toHaveText("");
  await expect(stop.locator("svg")).toHaveCount(1);
  await stop.click();
  await expect(input).toHaveValue("오래 걸리는 질문");
  await input.fill("새로운 질문");
  await page.getByRole("button", { name: "보내기", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("새로운 영어 놀이 응답");
  releaseFirst();
  await firstFinished;
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(1);
  await expect(page.getByTestId("ai-message-user").locator("p")).toHaveText("새로운 질문");
  await expect(page.getByRole("log", { name: "AI 대화" })).not.toContainText("취소된 오래된 응답");
});
