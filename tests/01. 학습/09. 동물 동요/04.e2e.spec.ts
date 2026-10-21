import { expect, test } from "@playwright/test";

test("동요 가사 구절 재생", async ({ page }) => {
  await page.goto("/watch/bunny-hop");
  const video = page.getByTestId("lesson-video");
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.locator(".song-lyrics li")).toHaveCount(4);
  await page.getByRole("button", { name: "2번 동요 구절 재생" }).click();
  const manifest = await (await page.request.get("/media/singalong/manifest.json")).json();
  const expected = manifest["bunny-hop"].segments.filter((s: {kind: string}) => s.kind === "song")[1].start;
  await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(expected);
  expect(await video.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeLessThan(expected + 3);
});
