import { expect, test } from "@playwright/test";

test("대화 선택 구간 이동", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole("button", { name: "2번 대화 영상 재생", exact: true }).click();
  const data = await (await page.request.get("/media/lessons/manifest.json")).json();
  const start = data["small-talk"].segments.filter((s: {kind: string}) => s.kind === "dialogue")[1].start;
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(start);
});
