import { expect, test } from "@playwright/test";
test("이전 글쓰기 화면은 놀이 홈으로 이동한다", async ({page}) => {
  for (const url of ["/studio", "/studio/posts/new", "/studio/posts/old/edit", "/studio/import", "/studio/media"]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", {name: "야옹! 나랑 같이 놀자."})).toBeVisible();
  }
  await expect(page.getByRole("link", {name: /글쓰기|스튜디오|가져오기/})).toHaveCount(0);
});
