import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { openPlay } from "../__util__";
import { mockTopicChat } from "./__mock__";

test("저장된 놀이 대화를 다시 열면 대화 안의 시각 카드도 복원된다", async ({ page }) => {
  await mockAiModels(page); const requests = await mockTopicChat(page); await createAccount(page);
  await openPlay(page);
  await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  await page.reload();
  const log = page.getByRole("log", { name: "AI 대화" });
  const visual = log.getByRole("article", { name: "손 흔들며 인사 학습 카드" });
  await expect(visual).toBeVisible();
  await expect(visual.getByRole("img")).toBeVisible();
  await expect(visual).toContainText("Hi! Bye!");
  await expect(log.getByTestId("ai-message-assistant")).toContainText("Wave your hand");
  expect(requests).toHaveLength(1);
});
