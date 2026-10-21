import { expect, test } from "@playwright/test";
test("레슨을 열면 영상 정지", async ({ page }) => {
  await page.goto("/");
  const video = page.getByTestId("momo-video");
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(false);
  await page.getByRole("button", { name: "오늘의 레슨 시작하기" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.paused))
    .toBe(true);
});
