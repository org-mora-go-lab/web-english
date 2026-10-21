import { expect, test } from "@playwright/test";
test("Momo 목소리 켜기와 음소거", async ({ page }) => {
  await page.goto("/");
  const video = page.getByTestId("momo-video");
  await expect
    .poll(() =>
      video.evaluate((element: HTMLVideoElement) => element.readyState),
    )
    .toBeGreaterThanOrEqual(2);
  await video.evaluate((element: HTMLVideoElement) => {
    element.currentTime = 7;
  });
  await page.getByRole("button", { name: "목소리 듣기", exact: true }).click();
  await expect
    .poll(() =>
      video.evaluate(
        (element: HTMLVideoElement) =>
          !element.muted && !element.paused && element.currentTime < 3,
      ),
    )
    .toBe(true);
  await page.getByRole("button", { name: "음소거", exact: true }).click();
  await expect
    .poll(() => video.evaluate((element: HTMLVideoElement) => element.muted))
    .toBe(true);
});
