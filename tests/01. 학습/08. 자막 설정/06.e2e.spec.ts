import { expect, test } from "@playwright/test";

test("홈 영상에도 자막 끄기 유지", async ({ page }) => {
  await page.goto("/watch/small-talk");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("off");
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  const video = page.getByTestId("momo-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).every(t => t.mode === "disabled"))).toBe(true);
});
