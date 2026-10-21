import { expect, test } from "@playwright/test";

test("브라우저 뒤로가기 필터 복원", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "둘러보기", exact: true }).click();
  await page.getByRole("button", { name: "여행", exact: true }).click();
  await page.getByRole("combobox", { name: "레슨 정렬" }).selectOption("제목순");
  await page.getByRole("link", { name: /레슨 열기$/ }).first().click();
  await expect(page).toHaveURL(/\/watch\//);
  await page.goBack();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("heading", { name: "나에게 맞는 영어 찾기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "여행", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("combobox", { name: "레슨 정렬" })).toHaveValue("제목순");
  await expect(page.getByRole("article")).toHaveCount(3);
});
