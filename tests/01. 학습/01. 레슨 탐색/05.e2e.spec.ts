import { expect, test } from "@playwright/test";
test("검색 제출 결과 이동", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("textbox", { name: "레슨 검색" }).fill("호텔");
  await page.getByRole("button", { name: "검색", exact: true }).click();
  await expect(page.getByRole("heading", { name: "검색 결과" })).toBeFocused();
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("textbox", { name: "레슨 검색" }).press("Enter");
  await expect(page.getByRole("heading", { name: "검색 결과" })).toBeFocused();
});
