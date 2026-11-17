import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("사이드바에서 새 채팅을 만든 뒤 저장된 놀이 대화로 돌아간다", async ({ page }) => {
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await page.getByRole("button", { name: "새 채팅", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await page.getByRole("button", { name: "손 흔들며 인사", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toContainText("Wave your hand");
  await expect(page.getByRole("log", { name: "AI 대화" }).getByRole("article", { name: "손 흔들며 인사 학습 카드" })).toBeVisible();
  expect(requests).toHaveLength(1);
});
