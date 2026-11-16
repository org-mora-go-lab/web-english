import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "./__mock__";

test("마이크 음소거와 해제를 실제 오디오 트랙에 반영한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.getByRole("button", { name: "마이크 끄기", exact: true }).click();
  expect((await voiceState(page)).enabled).toBe(false);
  await page.getByRole("button", { name: "마이크 켜기", exact: true }).click();
  expect((await voiceState(page)).enabled).toBe(true);
});
