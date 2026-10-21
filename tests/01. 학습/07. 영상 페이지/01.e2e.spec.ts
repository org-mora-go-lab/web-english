import { expect, test } from "@playwright/test";

test("목록 전체 영상 썸네일", async ({ page }) => {
  await page.goto("/");
  const cards = page.getByRole("article");
  await expect(cards).toHaveCount(15);
  for (const card of await cards.all()) {
    const link = card.locator("a.thumbnail");
    await expect(link).toHaveAttribute("href", /\/watch\//);
    await expect(link.getByRole("img")).toHaveAttribute("src", /poster/);
    await expect(card.locator(".duration")).toHaveText(/\d+:\d{2}/);
  }
});
