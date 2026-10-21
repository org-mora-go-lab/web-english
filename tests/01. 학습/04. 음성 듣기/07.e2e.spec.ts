import { expect, test } from "@playwright/test";

test("영상 로드 오류와 재시도", async ({ page }) => {
  await page.route("**/media/lessons/coffee.mp4", route => route.abort());
  await page.goto("/watch/coffee");
  await expect(page.locator(".player-error[role=alert]")).toContainText("영상을 불러오지 못했어요");
  await page.unroute("**/media/lessons/coffee.mp4");
  await page.getByRole("button", { name: "다시 시도", exact: true }).click();
  await expect(page.locator(".player-error[role=alert]")).toHaveCount(0);
  await expect.poll(() => page.getByTestId("lesson-video").evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
});
