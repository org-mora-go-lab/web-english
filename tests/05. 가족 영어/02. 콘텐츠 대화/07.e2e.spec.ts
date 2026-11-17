import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockTopicChat } from "./__mock__";

test("대화 내용은 높이를 채우고 스크롤해도 입력창은 화면 하단에 유지된다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await mockAiModels(page); await mockTopicChat(page); await createAccount(page);
  await page.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  const log = page.getByRole("log", { name: "AI 대화" });
  const before = await input.boundingBox();
  const logBounds = await log.boundingBox();
  expect(before).not.toBeNull(); expect(logBounds).not.toBeNull();
  expect(logBounds!.height).toBeGreaterThan(800 * .5);
  expect(before!.y + before!.height).toBeGreaterThan(800 - 160);
  await log.evaluate(element => { element.scrollTop = 0; });
  await expect(input).toBeInViewport();
  const after = await input.boundingBox();
  expect(Math.abs(after!.y - before!.y)).toBeLessThan(2);
});
