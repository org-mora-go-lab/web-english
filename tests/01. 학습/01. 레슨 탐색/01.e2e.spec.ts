import { expect, test } from "@playwright/test";

test("검색과 빈 결과", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("textbox", { name: "레슨 검색" }).fill("스몰토크");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("스몰토크");
  await page
    .getByRole("textbox", { name: "레슨 검색" })
    .fill("no-matching-lesson");
  await expect(
    page.getByRole("heading", { name: "일치하는 레슨이 없어요" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "검색 지우기" }).click();
  await expect(page.getByRole("article")).toHaveCount(15);
});
