import { expect, test } from "@playwright/test";

test("새 동요 학습 완료와 진행률", async ({ page }) => {
  await page.goto("/watch/leo-counts");
  await page.getByRole("button", { name: "오늘의 학습 완료", exact: true }).click();
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/library");
  await page.getByRole("button", { name: "완료한 레슨", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("사자 Leo");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "25");
  await expect(page.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
});
