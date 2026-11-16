import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice, voiceStarts } from "./__mock__";

test("음성 종료 후 늦은 인식 이벤트는 메시지를 보내지 않는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page);
  let sends = 0; page.on("request", request => { if (request.url().endsWith("/api/ai/chat")) sends++; });
  await page.goto("/ai"); await page.getByRole("button", { name: "음성 대화 시작", exact: true }).click();
  await page.evaluate(() => { const w = window as unknown as { __voice: { mic: { onresult: (e: unknown) => void }; late?: (e: unknown) => void } }; w.__voice.late = w.__voice.mic.onresult; });
  await page.getByRole("button", { name: "음성 대화 종료", exact: true }).click();
  await page.getByRole("button", { name: "음성 대화 시작", exact: true }).click();
  await page.evaluate(() => (window as unknown as { __voice: { late: (e: unknown) => void } }).__voice.late({ results: [{ isFinal: true, 0: { transcript: "late words" } }] }));
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEmpty();
  expect(await voiceStarts(page)).toBe(2); expect(sends).toBe(0);
});
