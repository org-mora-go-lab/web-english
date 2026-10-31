import { expect, test } from "@playwright/test";
test("모든 레슨의 학습 콘텐츠", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/library");
  const cards = page.getByRole("link", { name: /레슨 열기$/ });
  await expect(cards).toHaveCount(15);
  for (let index = 0; index < 15; index++) {
    await cards.nth(index).click();
    const dialog = page.locator(".watch-primary");
    await expect(dialog.locator(".watch-description")).not.toBeEmpty();
    await expect(dialog.locator(".watch-description p").first()).toBeVisible();
    await expect(dialog.locator("ol > li")).toHaveCount(5);
    await expect(dialog.locator(".vocabulary > span")).toHaveCount(3);
    await expect(dialog.locator(".dialogue-line")).toHaveCount(4);
    await expect(dialog.locator(".practice-tip p")).not.toBeEmpty();
    const video = page.getByTestId("lesson-video");
    await expect.poll(() => video.evaluate((v: HTMLVideoElement) => v.readyState)).toBeGreaterThanOrEqual(2);
    expect(await video.evaluate((v: HTMLVideoElement) => v.duration)).toBeGreaterThan(40);
    await expect(
      dialog
        .getByRole("group", { name: "03. 이해도 확인" })
        .getByRole("button"),
    ).toHaveCount(3);
    await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
    await expect(page).toHaveURL("/library");
    await expect(page.getByRole("article")).toHaveCount(15);
  }
});
