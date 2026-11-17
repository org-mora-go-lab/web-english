import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceState } from "./__mock__";

test("선택한 고급 목소리로 연결하고 연결 중 변경을 막는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page); await page.goto("/ai");
  await waitForChatControls(page);
  const selector = page.getByRole("combobox", { name: "목소리", exact: true });
  await expect(selector.locator("option")).toHaveText(["고양이 · 귀엽고 다정하게", "여자 · Marin", "남자 · Cedar"]);
  for (const [index, voice] of (["cat", "marin", "cedar"] as const).entries()) {
    await waitForChatControls(page);
    await selector.selectOption(voice);
    await expect(page.locator(".ai-chat-voice-label")).toHaveText({ cat: "고양이", marin: "여자", cedar: "남자" }[voice]!);
    await page.getByRole("button", { name: "고급 음성 시작", exact: true }).click();
    await expect.poll(async () => (await voiceState(page)).starts).toBe(index + 1);
    expect((await voiceState(page)).requests[index].voice).toBe(voice);
    await waitForChatControls(page);
    await expect(selector).toBeDisabled();
    await page.getByRole("button", { name: "고급 음성 종료", exact: true }).click();
    await expect(selector).toBeEnabled();
  }
});
