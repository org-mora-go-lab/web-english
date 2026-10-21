import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("음성 재생 중지", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  const before = await page.evaluate(() => window.__moraSpeech.cancels);
  await page.getByRole("button", { name: "듣기 중지", exact: true }).click();
  expect(await page.evaluate(() => window.__moraSpeech.cancels)).toBe(
    before + 1,
  );
  await expect(
    page.getByRole("button", { name: "듣기 중지", exact: true }),
  ).toHaveCount(0);
});
