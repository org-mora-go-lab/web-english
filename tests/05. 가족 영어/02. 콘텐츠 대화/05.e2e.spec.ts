import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockVoice, voiceState } from "../../06. AI 영어/04. 음성 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("음성 중 고른 콘텐츠는 연결을 유지하고 종료 뒤 주제 대화를 시작한다", async ({page}) => {
  await mockVoice(page); await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", {name: "고급 음성 시작", exact: true}).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.getByRole("button", {name: /오늘의 놀이 보기/}).click();
  await expect(page.getByText("음성을 종료하면 선택한 주제로 대화를 시작해요.")).toBeVisible();
  expect(requests).toHaveLength(0); expect((await voiceState(page)).closed).toBe(0);
  await page.getByRole("button", {name: "고급 음성 종료", exact: true}).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  expect(requests).toHaveLength(1);
});
