import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("음성 엔진 오류 안내", async ({ page }) => {
  await mockSpeech(page, "error");
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  await expect(page.locator(".speech-status")).toContainText(
    "음성을 재생할 수 없습니다",
  );
  await expect(
    page.getByRole("button", { name: "듣기 중지", exact: true }),
  ).toHaveCount(0);
});
