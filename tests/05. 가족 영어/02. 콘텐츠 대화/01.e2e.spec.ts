import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { openPlay } from "../__util__";
import { mockTopicChat } from "./__mock__";

test("모바일 놀이 선택은 주제 대화를 시작하고 다음 답변에도 같은 문맥을 보낸다", async ({page}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await openPlay(page);
  await expect(page.locator(".play-header-title")).toHaveText("손 흔들며 인사");
  const log = page.getByRole("log", { name: "AI 대화" });
  await expect(log.getByRole("article", { name: "손 흔들며 인사 학습 카드" })).toBeVisible();
  await expect(log.getByTestId("ai-message-assistant")).toContainText("Wave your hand");
  await expect(page.getByRole("main", { name: "영어 학습 콘텐츠" })).toBeHidden();
  expect(requests).toHaveLength(1);
  expect(requests[0].messages[0].content).toContain("놀이 방법:");
  expect(requests[0].messages[0].content).toContain("Hi! Bye!");
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeInViewport();
  await page.getByRole("textbox", {name: "AI에게 보낼 메시지"}).fill("아이가 손을 흔들었어요. 다음에는요?");
  await page.getByRole("button", {name: "보내기", exact: true}).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  expect(requests[1].conversationId).toBe(requests[0].conversationId);
  expect(requests[1].revision).toBe(1);
  expect(requests[1].messages).toHaveLength(3);
  expect(requests[1].messages[0].content).toContain("손 흔들며 인사");
});
