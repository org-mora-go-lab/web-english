import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "./__mock__";

test("화면이 숨겨지면 고급 음성을 종료한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.evaluate(() => { Object.defineProperty(document, "hidden", { configurable: true, value: true }); document.dispatchEvent(new Event("visibilitychange")); });
  await expect(page.getByRole("button", { name: "고급 음성 시작", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect((await voiceState(page)).stopped).toBeGreaterThan(0);
});
