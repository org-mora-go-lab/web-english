import { expect, test } from "@playwright/test";

test("챕터 구간 재생", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole("region", { name: "영상 구간" }).getByRole("button", { name: /복습/ }).click();
  const data = await (await page.request.get("/media/lessons/manifest.json")).json();
  const start = data["small-talk"].segments.find((s: {kind: string}) => s.kind === "review").start;
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(start);
});
