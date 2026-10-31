import { expect, test } from "@playwright/test";
test("헤더 학습 현황과 홈 복귀", async ({ page }) => {
  await page.goto("/library");
  await page
    .getByRole("button", { name: "나의 완료한 레슨", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "완료한 레슨", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Mora English 홈", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "동물 친구와 노래하며 영어를 만나요." }),
  ).toBeVisible();
});
