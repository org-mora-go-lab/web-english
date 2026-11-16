import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { mockVoice } from "./__mock__";

test("마이크 권한 거절을 안내하고 자동 전송을 하지 않는다", async ({ page }) => {
  await mockVoice(page); await createAccount(page); await mockAiModels(page);
  let sends = 0; page.on("request", request => { if (request.url().endsWith("/api/ai/chat")) sends++; });
  await page.goto("/ai"); await page.getByRole("button", { name: "음성 대화 시작", exact: true }).click();
  await page.evaluate(() => (window as unknown as { __voice: { mic: { onerror: (event: unknown) => void } } }).__voice.mic.onerror({ error: "not-allowed" }));
  await expect(page.getByRole("alert").filter({ hasText: "마이크 권한이 필요해요" })).toBeVisible();
  await expect(page.getByRole("button", { name: "음성 대화 시작", exact: true })).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
  expect(sends).toBe(0);
});
