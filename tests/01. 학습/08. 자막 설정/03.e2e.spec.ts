import { expect, test } from "@playwright/test";

test("자막 언어 새 탭 유지", async ({ page }) => {
  await page.goto("/watch/small-talk");
  await page.getByRole("combobox", { name: "영상 자막", exact: true }).selectOption("ko");
  const other = await page.context().newPage();
  await other.goto("/watch/coffee");
  await expect(other.getByRole("combobox", { name: "영상 자막", exact: true })).toHaveValue("ko");
  await expect.poll(() => other.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => Array.from(v.textTracks).find(t => t.language === "ko")?.mode)).toBe("showing");
});
