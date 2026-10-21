import { expect, test } from "@playwright/test";

test("부모 함께 놀이와 해석", async ({ page }) => {
  await page.goto("/watch/panda-body");
  const practice = page.getByRole("region", { name: "동요 가사와 함께 놀이" });
  await practice.getByRole("button", { name: "해석 보기", exact: true }).click();
  await expect(practice.getByText("작은 코를 톡 만져요", { exact: true })).toBeVisible();
  await practice.getByText("보호자와 함께 해 봐요", { exact: true }).click();
  await expect(practice.locator(".play-words > span")).toHaveCount(3);
});
