import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "./__mock__";

test("마이크 권한 거절 시 고급 음성 요청 없이 안내한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page);
  await page.goto("/ai");
  await page.evaluate(() => { (window as unknown as { __voice: { denied: boolean } }).__voice.denied = true; });
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "마이크 권한이 필요해요" })).toBeVisible();
  await expect(page.getByRole("button", { name: "고급 음성 시작", exact: true })).toHaveAttribute("aria-pressed", "false");
  expect((await voiceState(page)).starts).toBe(0);
});
