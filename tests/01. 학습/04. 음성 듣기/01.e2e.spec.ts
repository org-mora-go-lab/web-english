import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("전체 핵심 문장 재생과 종료", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  const calls = await page.evaluate(() => window.__moraSpeech.calls);
  expect(calls).toHaveLength(1);
  expect(calls[0].text).toBe(
    "How has your day been? Do you have any plans for the weekend? It was lovely talking to you. How was your weekend? I tried a new café near my place.",
  );
  expect(calls[0].lang).toBe("en-US");
  await page.evaluate(() => window.__moraSpeech.finish());
  await expect(
    page.getByRole("button", { name: "듣기 중지", exact: true }),
  ).toHaveCount(0);
});
