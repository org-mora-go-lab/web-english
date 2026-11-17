import { expect, test } from "@playwright/test";

test("브라우저 탭은 Mora 영어 제목과 모라 아이콘을 제공한다", async ({ page }) => {
  for (const path of ["/", "/ai"]) {
    await page.goto(path); await expect(page).toHaveTitle("Mora 영어");
    const icon = page.locator('link[rel="icon"][type="image/svg+xml"]');
    await expect(icon).toHaveCount(1);
    const response = await page.request.get((await icon.getAttribute("href"))!);
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
    expect(await response.text()).toContain('<svg');
  }
});
