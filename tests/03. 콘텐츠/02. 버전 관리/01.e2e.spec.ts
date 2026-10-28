import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("이전 본문 버전을 복원한다", async ({ page }) => {
  await createVerifiedAccount(page);
  await page.goto("/studio/posts/new");
  await page.getByLabel("제목").fill("버전 기록 글");
  await page.locator(".tiptap").fill("첫 번째 문장");
  await page.getByRole("button", { name: "임시 저장" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  await page.locator(".tiptap").fill("두 번째 문장");
  await page.getByRole("button", { name: "임시 저장" }).click();
  await expect(page.getByRole("status")).toContainText("저장했습니다");
  await page.getByRole("button", { name: "버전 기록 보기" }).click();
  await page.getByRole("button", { name: /버전 1 .* 복원/ }).click();
  await expect(page.locator(".tiptap")).toContainText("첫 번째 문장");
});
