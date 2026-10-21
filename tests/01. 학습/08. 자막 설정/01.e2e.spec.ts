import { expect, test } from "@playwright/test";

test("자막 끄기 새로고침 복원", async ({ page }) => {
  await page.goto("/watch/small-talk");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("off");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("off");
  await expect.poll(() => page.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(() => page.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).every(t => t.mode === "disabled"))).toBe(true);
});
