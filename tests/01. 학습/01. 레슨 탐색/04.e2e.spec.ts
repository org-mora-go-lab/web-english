import { expect, test } from "@playwright/test";

test("사이드 탭 5개", async ({ page }) => {
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "주 메뉴" });
  await expect(navigation.getByRole("button")).toHaveCount(5);
  await expect(navigation.getByRole("button")).toHaveText([
    "홈",
    "둘러보기",
    "저장한 레슨",
    "최근 학습",
    "완료한 레슨",
  ]);
  await navigation
    .getByRole("button", { name: "둘러보기", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "나에게 맞는 영어 찾기" }),
  ).toBeVisible();
});
