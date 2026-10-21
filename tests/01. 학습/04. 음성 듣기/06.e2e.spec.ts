import { expect, test } from "@playwright/test";

import { mockSpeech } from "../../__mock__";
test("음성 미지원 안내", async ({ page }) => {
  await mockSpeech(page, "unsupported");
  await page.goto("/");
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await page.getByRole("button", { name: "전체 듣기", exact: true }).click();
  await expect(page.locator(".speech-status")).toContainText(
    "음성 듣기를 지원하지 않습니다",
  );
  await page.getByRole("button", { name: "해석 보기", exact: true }).click();
  await expect(
    page.getByText("오늘 하루 어땠어요?", { exact: true }),
  ).toBeVisible();
});
