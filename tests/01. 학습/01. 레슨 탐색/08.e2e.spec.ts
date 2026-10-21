import { expect, test } from "@playwright/test";
test("빈 결과에서 전체 탐색 복귀", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: "레슨 검색" }).fill("없는검색어");
  await page.getByRole("button", { name: "모든 레슨 둘러보기" }).click();
  await expect(
    page.getByRole("heading", { name: "나에게 맞는 영어 찾기" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(25);
  await expect(page.getByRole("textbox", { name: "레슨 검색" })).toHaveValue(
    "",
  );
});
