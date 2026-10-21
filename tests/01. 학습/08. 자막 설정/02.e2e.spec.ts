import { expect, test } from "@playwright/test";

test("자막 끄기 영상 이동 유지", async ({ page }) => {
  await page.goto("/watch/small-talk");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("off");
  await page.getByRole("complementary", { name: "다음 학습 영상" }).getByRole("link").first().click();
  await expect(page).not.toHaveURL("/watch/small-talk");
  await expect(page.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("off");
  await expect.poll(() => page.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).every(t => t.mode === "disabled"))).toBe(true);
});
