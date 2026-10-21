import { expect, test } from "@playwright/test";

test("주제 필터", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "여행", exact: true }).first().click();
  await expect(page.getByRole("article")).toHaveCount(3);
  await expect(
    page.getByRole("article").filter({ hasText: "카페" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("article").filter({ hasText: "공항" }),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "전체", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(15);
});
