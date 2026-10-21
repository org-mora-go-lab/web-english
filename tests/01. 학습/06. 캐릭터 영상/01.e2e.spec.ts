import { expect, test } from "@playwright/test";
test("홈 영상 실제 자동 재생", async ({ page }) => {
  await page.goto("/");
  const video = page.getByTestId("momo-video");
  await expect(video).toBeInViewport();
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => ({
        ready: element.readyState >= 2,
        muted: element.muted,
        loop: element.loop,
        paused: element.paused,
        duration: element.duration > 19 && element.duration < 21,
      })),
    )
    .toEqual({
      ready: true,
      muted: true,
      loop: true,
      paused: false,
      duration: true,
    });
  const before = await video.evaluate(
    (element: HTMLVideoElement) => element.currentTime,
  );
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(before + 0.5);
});
