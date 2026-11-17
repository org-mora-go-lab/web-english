import { expect, test } from "@playwright/test";
test("이전 글쓰기 화면은 비회원 홈의 로그인 안내로 이동한다", async ({page}) => {
  for (const url of ["/studio", "/studio/posts/new", "/studio/posts/old/edit", "/studio/import", "/studio/media"]) {
    await page.goto(url);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", {name: /로그인하고\s*영어 놀이를 시작해요/})).toBeVisible();
  }
  await expect(page.getByRole("link", {name: /글쓰기|스튜디오|가져오기/})).toHaveCount(0);
});
