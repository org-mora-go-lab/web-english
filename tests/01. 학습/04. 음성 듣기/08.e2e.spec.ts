import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("이전 음성 취소 이벤트 무시", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  await page
    .getByRole("button", { name: "1번 문장 듣기", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "듣기 중지", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".speech-status")).toHaveText(
    "영어 음성을 재생하고 있어요.",
  );
  expect(await page.evaluate(() => window.__moraSpeech.calls)).toHaveLength(2);
});
