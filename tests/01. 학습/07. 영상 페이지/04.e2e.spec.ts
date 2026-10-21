import { expect, test } from "@playwright/test";

test("시청 페이지 새로고침과 직접 접근", async ({ page }) => {
  await page.goto("/watch/airport");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("공항");
  await page.reload();
  await expect(page.getByTestId("lesson-video")).toHaveAttribute("src", "/media/lessons/airport.mp4");
  await page.getByRole("link", { name: "목록으로 돌아가기" }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("article")).toHaveCount(15);
});
