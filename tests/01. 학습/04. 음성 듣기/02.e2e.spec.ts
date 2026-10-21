import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("선택 문장만 재생", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page
    .getByRole("button", { name: "2번 문장 듣기", exact: true })
    .click();
  expect(
    await page.evaluate(() =>
      window.__moraSpeech.calls.map((call) => call.text),
    ),
  ).toEqual(["Do you have any plans for the weekend?"]);
});
