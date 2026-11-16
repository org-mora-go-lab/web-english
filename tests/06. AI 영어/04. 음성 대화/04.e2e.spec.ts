import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceState } from "./__mock__";

test("고급 음성 종료 시 마이크와 연결을 해제하고 늦은 이벤트를 무시한다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.getByRole("button", { name: "고급 음성 종료", exact: true }).click();
  await voiceEvent(page, { kind: "user", text: "late text" });
  await expect(page.getByTestId("ai-message-pending")).toHaveCount(0);
  expect((await voiceState(page)).stopped).toBeGreaterThan(0);
  expect((await voiceState(page)).closed).toBeGreaterThan(0);
  await expect.poll(async () => (await voiceState(page)).deletes).toBe(1);
});
