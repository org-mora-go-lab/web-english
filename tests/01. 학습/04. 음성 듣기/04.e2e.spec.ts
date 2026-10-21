import { expect, test } from "@playwright/test";

test("영상 일시 정지", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await video.evaluate((v: HTMLVideoElement) => v.play());
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.2);
  await video.evaluate((v: HTMLVideoElement) => v.pause());
  const time = await video.evaluate((v: HTMLVideoElement) => v.currentTime);
  await page.waitForTimeout(400);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeCloseTo(time, 1);
});
