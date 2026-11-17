import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("콘텐츠를 여닫아도 대화와 입력 중인 문장은 유지된다", async ({page}) => {
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", {name: /오늘의 놀이 보기/}).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  const input = page.getByRole("textbox", {name: "AI에게 보낼 메시지"});
  await input.fill("이 문장을 연습하고 싶어요");
  await expect(page.getByRole("main", { name: "영어 학습 콘텐츠" })).toBeHidden();
  await page.getByRole("button", { name: "콘텐츠 열기", exact: true }).click();
  await expect(page.getByRole("main", { name: "영어 학습 콘텐츠" })).toBeVisible();
  await page.getByRole("button", { name: "학습 콘텐츠 닫기" }).click();
  await expect(page.getByRole("main", { name: "영어 학습 콘텐츠" })).toBeHidden();
  await expect(page.getByRole("log", { name: "AI 대화" }).getByRole("article", { name: "손 흔들며 인사 학습 카드" })).toBeVisible();
  await expect(input).toBeInViewport();
  await expect(input).toHaveValue("이 문장을 연습하고 싶어요");
  expect(requests).toHaveLength(1);
});
