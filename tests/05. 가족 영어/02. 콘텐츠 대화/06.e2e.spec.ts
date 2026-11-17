import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("새 대화를 시작하면 이전 학습 주제를 해제하고 재전송하지 않는다", async ({page}) => {
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", {name: /오늘의 놀이 보기/}).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await page.getByRole("button", { name: "새 채팅", exact: true }).click();
  await expect(page.getByText("학습 주제", {exact: true})).toHaveCount(0);
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await expect(page.getByRole("log", { name: "AI 대화" }).getByRole("article", { name: "손 흔들며 인사 학습 카드" })).toHaveCount(0);
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeEmpty();
  expect(requests).toHaveLength(1);
});
