import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";
import { mockVoice, voiceState } from "../../06. AI 영어/04. 음성 대화/__mock__";

test("채팅의 고급 음성은 사이드바 전환에도 같은 연결을 유지한다", async ({ page }) => {
  await mockVoice(page); await mockAiModels(page); await createAccount(page);
  await waitForChatControls(page);
  await page.getByRole("combobox", {name: "목소리", exact: true}).selectOption("cat");
  await page.getByRole("button", {name: "고급 음성 시작", exact: true}).click();
  await expect.poll(async () => (await voiceState(page)).enabled).toBe(true);
  await page.getByRole("button", {name: "콘텐츠", exact: true}).click();
  await expect(page.getByRole("dialog", { name: "영어 학습 콘텐츠" })).toBeVisible();
  await page.getByRole("button", { name: "학습 콘텐츠 닫기" }).click();
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeInViewport();
  const state = await voiceState(page);
  expect(state.starts).toBe(1); expect(state.closed).toBe(0); expect(state.requests[0].voice).toBe("cat");
  await page.getByRole("button", {name: "고급 음성 종료", exact: true}).click();
});
