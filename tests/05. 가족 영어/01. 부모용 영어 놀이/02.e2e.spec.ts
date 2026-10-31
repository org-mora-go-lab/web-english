import { expect, test } from "@playwright/test";

test("18~36개월 커리큘럼을 3개월 단위로 볼 수 있다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "커리큘럼", exact: true }).click();
  await expect(page.getByRole("tab")).toHaveCount(8);
  await page.getByRole("tab", { name: "33–35개월" }).click();
  await expect(page.getByText("역할놀이와 이야기")).toBeVisible();
  await page.getByRole("tab", { name: "36개월" }).click();
  await expect(page.getByText("좋아한 놀이 돌아보기")).toBeVisible();
});
