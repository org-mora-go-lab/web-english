import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("주제 대화 오류는 자동 반복하지 않고 같은 요청으로 재시도한다", async ({page}) => {
  await mockAiModels(page); const requests = await mockTopicChat(page, true); await createAccount(page);
  await page.getByRole("button", {name: /오늘의 놀이 보기/}).click();
  await expect(page.getByRole("region", {name: "AI 영어 도우미"}).getByRole("alert")).toContainText("잠시 연결이 끊겼어요");
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toHaveValue(/손 흔들며 인사/);
  expect(requests).toHaveLength(1);
  await page.getByRole("button", {name: "다시 보내기", exact: true}).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[1].turnId).toBe(requests[0].turnId);
  await expect(page.getByTestId("ai-message-user")).toHaveCount(1);
});
