import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { openPlay } from "../__util__";
import { mockTopicChat } from "./__mock__";

test("개월수를 바꾸어 고른 놀이는 해당 개월수 문맥으로 같은 대화를 이어간다", async ({ page }) => {
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await openPlay(page); await expect(page.getByTestId("ai-message-assistant")).toHaveCount(1);
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  await page.getByRole("combobox", { name: "콘텐츠 개월수", exact: true }).selectOption("19");
  await page.getByRole("dialog").getByRole("button", { name: /자동차 출발하기/ }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(2);
  expect(requests[1].conversationId).toBe(requests[0].conversationId);
  expect(requests[1].messages.at(-1)?.content).toContain("19개월 아이의 부모");
  expect(requests[1].messages.at(-1)?.content).toContain("Go, car!");
  expect(requests[1].messages.at(-1)?.content).toContain("부모 가이드:");
  await expect(page.getByRole("dialog")).toBeHidden();
});
