import { expect, test } from "@playwright/test";

test("영어 한국어 자막 선택", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.textTracks.length)).toBe(2);
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("ko");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).find(t => t.language === "ko")?.mode)).toBe("showing");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("off");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).every(t => t.mode === "disabled"))).toBe(true);
});
