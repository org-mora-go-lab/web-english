import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("모바일에서도 콘텐츠를 보는 동안 대화 입력창을 사용할 수 있다", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await mockAiModels(page); await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", {name: "메뉴 열기"}).click();
  await page.getByRole("button", {name: "커리큘럼", exact: true}).click();
  await expect(page.getByRole("main", {name: "영어 학습 콘텐츠"})).toBeInViewport();
  const input = page.getByRole("textbox", {name: "AI에게 보낼 메시지"});
  await expect(input).toBeInViewport();
  await input.fill("Hello, Mora!");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", {name: "학습 콘텐츠 닫기"}).click();
  await expect(input).toHaveValue("Hello, Mora!");
  await expect(input).toBeInViewport();
});
