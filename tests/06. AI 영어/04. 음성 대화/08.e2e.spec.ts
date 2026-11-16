import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "./__mock__";

test("선택한 고급 목소리로 연결하고 연결 중 변경을 막는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("combobox", { name: "목소리", exact: true }).selectOption("cedar");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).starts).toBe(1);
  expect((await voiceState(page)).requests[0].voice).toBe("cedar");
  await expect(page.getByRole("combobox", { name: "목소리", exact: true })).toBeDisabled();
});
