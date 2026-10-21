import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("음성 시작 시간 초과", async ({ page }) => {
  await mockSpeech(page, "stalled");
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.clock.install();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  await page.clock.fastForward(9000);
  await expect(page.locator(".speech-status")).toContainText(
    "음성 재생이 시작되지 않았습니다",
  );
  await expect(
    page.getByRole("button", { name: "듣기 중지", exact: true }),
  ).toHaveCount(0);
});
