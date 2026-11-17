import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("모바일은 상단 펼침 설정 없이 콘텐츠 탐색과 하단 입력을 함께 제공한다", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await mockAiModels(page); await mockTopicChat(page); await createAccount(page);
  await expect(page.getByRole("button", { name: "콘텐츠 열기", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "콘텐츠 닫기", exact: true })).toHaveCount(0);
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await input.fill("Hello, Mora!");
  await page.getByRole("button", {name: "콘텐츠", exact: true}).click();
  await expect(page.getByRole("main", {name: "영어 학습 콘텐츠"})).toBeInViewport();
  await expect(input).toBeInViewport();
  await expect(page.getByRole("dialog", { name: "영어 학습 콘텐츠" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", {name: "학습 콘텐츠 닫기"}).click();
  await expect(input).toHaveValue("Hello, Mora!");
  await expect(input).toBeInViewport();
  const bounds = await input.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeGreaterThan(844 - 180);
  await page.setViewportSize({ width: 390, height: 568 });
  await expect(input).toBeInViewport();
  const shortBounds = await input.boundingBox();
  expect(shortBounds).not.toBeNull();
  expect(shortBounds!.y + shortBounds!.height).toBeLessThanOrEqual(568);
  expect(shortBounds!.y + shortBounds!.height).toBeGreaterThan(568 - 180);
});
