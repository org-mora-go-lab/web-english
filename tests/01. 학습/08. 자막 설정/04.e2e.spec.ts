import { expect, test } from "@playwright/test";

test("플레이어 자체 자막 끄기 기억", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).find(t => t.language === "en")?.mode)).toBe("showing");
  await video.evaluate((v: HTMLVideoElement) => { for (const track of Array.from(v.textTracks)) track.mode = "disabled"; });
  await expect(page.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("off");
  await page.goto("/watch/coffee");
  await expect(page.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("off");
});
