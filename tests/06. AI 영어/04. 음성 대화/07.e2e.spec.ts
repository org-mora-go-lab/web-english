import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceEvent, voiceState } from "./__mock__";

test("서버가 음성 종료를 알리면 텍스트 대화로 돌아온다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await voiceEvent(page, { kind: "ended", message: "음성 연결에 오류가 발생했어요." });
  await expect(page.getByText("음성 연결에 오류가 발생했어요.", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
});
