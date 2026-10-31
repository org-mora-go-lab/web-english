import { expect, test } from "@playwright/test";
test("영상 일시 정지와 시간 이동", async ({ page }) => {
  await page.goto("/library");
  const video = page.getByTestId("momo-video");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await video.evaluate((element: HTMLVideoElement) => {
    element.pause();
    element.currentTime = 6;
  });
  await expect(
    page.getByText("재생 버튼을 눌러 인사해 보세요", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeCloseTo(6, 0);
  await video.evaluate((element: HTMLVideoElement) => element.play());
  await expect(
    page.getByText("영어 자막과 함께 재생 중", { exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.currentTime),
    )
    .toBeGreaterThan(6.2);
});
