import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("대화 재생과 레슨 닫기", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "대화 듣기", exact: true }).click();
  expect(await page.evaluate(() => window.__moraSpeech.calls[0].text)).toBe(
    "How was your weekend? Pretty good. I tried a new café near my place. That sounds nice. Do you have any plans for next weekend? Not yet. Do you have any recommendations?",
  );
  const before = await page.evaluate(() => window.__moraSpeech.cancels);
  await page.getByRole("button", { name: "레슨 닫기" }).click();
  expect(await page.evaluate(() => window.__moraSpeech.cancels)).toBe(
    before + 1,
  );
});
