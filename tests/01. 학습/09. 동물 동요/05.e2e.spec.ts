import { expect, test } from "@playwright/test";

test("노래 반복 구간", async ({ page }) => {
  await page.goto("/watch/ducky-quack");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole("region", { name: "영상 구간" }).getByRole("button", { name: /한 번 더/ }).click();
  const manifest = await (await page.request.get("/media/singalong/manifest.json")).json();
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(manifest["ducky-quack"].chapters.repeat);
});
