import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("음성 속도 선택", async ({ page }) => {
  await mockSpeech(page);
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("combobox", { name: "듣기 속도" }).selectOption("0.7");
  await page
    .getByRole("button", { name: "1번 문장 듣기", exact: true })
    .click();
  expect(await page.evaluate(() => window.__moraSpeech.calls[0].rate)).toBe(
    0.7,
  );
});
