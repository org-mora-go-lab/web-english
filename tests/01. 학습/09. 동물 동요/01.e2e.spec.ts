import { expect, test } from "@playwright/test";

test("홈 동물 동요 10편 프리뷰", async ({ page }) => {
  await page.goto("/library");
  const gallery = page.getByRole("region", { name: "동물 친구 영어 동요" });
  await expect(gallery.locator(".singalong-card")).toHaveCount(10);
  await expect(gallery.getByRole("link", { name: /동요 보기$/ })).toHaveCount(10);
  await expect(gallery.locator(".song-preview img")).toHaveCount(10);
  await expect(gallery.getByRole("heading", { name: "노래로 만나는 10마리 동물 친구" })).toBeVisible();
  for (const preview of await gallery.locator(".song-preview img").all()) {
    await preview.scrollIntoViewIfNeeded();
    await expect.poll(() => preview.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  }
});
