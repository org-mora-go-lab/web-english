import { expect, test } from "@playwright/test";

test("관련 영상 전환", async ({ page }) => {
  await page.goto("/watch/small-talk");
  const next = page.getByRole("complementary", { name: "다음 학습 영상" }).getByRole("link").first();
  const href = await next.getAttribute("href");
  await next.click();
  await expect(page).toHaveURL(href!);
  await expect(page.getByTestId("lesson-video")).not.toHaveAttribute("src", "/media/lessons/small-talk.mp4");
  await page.goBack();
  await expect(page).toHaveURL("/watch/small-talk");
});
