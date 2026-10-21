import { expect, test } from "@playwright/test";

test("10종 동요 영상 실제 1080p 재생", async ({ page }) => {
  test.setTimeout(120000);
  const manifest = await (await page.request.get("/media/singalong/manifest.json")).json();
  expect(Object.keys(manifest)).toHaveLength(10);
  for (const [id, data] of Object.entries(manifest) as [string, {fps: number; width: number; height: number; captions: string}][]) {
    expect(data.fps).toBe(30);
    expect(data.width).toBe(1920);
    expect(data.height).toBe(1080);
    await page.goto(`/watch/${id}`);
    const video = page.getByTestId("lesson-video");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.videoWidth)).toBe(1920);
    expect(await video.evaluate((v: HTMLVideoElement) => v.videoHeight)).toBe(1080);
    expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeGreaterThan(35);
    expect(await (await page.request.get(`${data.captions}.en.vtt`)).text()).toContain("WEBVTT");
  }
});
