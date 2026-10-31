import { expect, test } from "@playwright/test";

test("부모 가이드에 화면 밖 놀이 원칙이 있다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "부모 가이드", exact: true }).click();
  await expect(page.getByRole("heading", { name: "카드 한 장, 20초" })).toBeVisible();
  await expect(page.getByText("영어를 따라 말하지 않아도 괜찮아요.", { exact: false })).toBeVisible();
});
