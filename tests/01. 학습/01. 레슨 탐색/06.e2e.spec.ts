import { expect, test } from "@playwright/test";
test("난이도와 카테고리 교차 필터", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("button", { name: "표현 & 문법", exact: true }).click();
  await page.getByRole("combobox", { name: "레슨 난이도" }).selectOption("A1");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("at, on, in");
  await page.getByRole("button", { name: "필터 초기화" }).click();
  await expect(page.getByRole("article")).toHaveCount(15);
  await expect(page.getByRole("combobox", { name: "레슨 난이도" })).toHaveValue(
    "전체",
  );
});
