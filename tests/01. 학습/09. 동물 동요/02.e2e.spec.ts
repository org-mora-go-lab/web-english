import { expect, test } from "@playwright/test";

test("동물 친구 필터", async ({ page }) => {
  await page.goto("/");
  const gallery = page.getByRole("region", { name: "동물 친구 영어 동요" });
  await gallery.getByRole("button", { name: "Bibi", exact: true }).click();
  await expect(gallery.locator(".singalong-card")).toHaveCount(1);
  await expect(gallery.locator(".singalong-card")).toContainText("토끼 Bibi");
  await gallery.getByRole("button", { name: "모든 친구", exact: true }).click();
  await expect(gallery.locator(".singalong-card")).toHaveCount(10);
});
