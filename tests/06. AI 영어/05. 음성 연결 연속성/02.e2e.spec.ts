import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceState } from "../04. 음성 대화/__mock__";

test("자동 갱신 후에도 음소거를 유지한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.getByRole("button", { name: "마이크 끄기", exact: true }).click();
  const first = await voiceState(page);
  await voiceEvent(page, { kind: "renewing" });
  await voiceEvent(page, { kind: "renew", sessionId: first.sessionIds[0] });
  await expect.poll(async () => (await voiceState(page)).starts).toBe(2);
  await expect(page.getByText("듣고 있어요. 편하게 말씀해 주세요.", { exact: true })).toBeVisible();
  await expect(page.getByText("마이크가 꺼져 있어요.", { exact: true })).toBeVisible();
  expect((await voiceState(page)).enabled).toBe(false);
  await page.getByRole("button", { name: "마이크 켜기", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
});
