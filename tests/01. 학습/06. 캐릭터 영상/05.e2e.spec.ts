import { expect, test } from "@playwright/test";
test("영상 대본과 해석 펼치기", async ({ page }) => {
  await page.goto("/");
  await page.getByText("영어 대본과 해석 보기", { exact: true }).click();
  await expect(page.locator(".video-transcript li")).toHaveCount(4);
  await expect(
    page.getByText("Hi! I'm Momo, your English buddy.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("안녕! 나는 너의 영어 친구 Momo야.", { exact: true }),
  ).toBeVisible();
  await page.getByText("영어 대본과 해석 보기", { exact: true }).click();
  await expect(
    page.getByText("Hi! I'm Momo, your English buddy.", { exact: true }),
  ).not.toBeVisible();
});
