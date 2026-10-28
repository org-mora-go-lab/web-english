import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("다른 회원의 비공개 글을 숨긴다", async ({ browser, page }) => {
  await createVerifiedAccount(page);
  await page.goto("/studio/posts/new");
  await page.getByLabel("제목").fill("비공개 연습 글");
  await page.locator(".tiptap").fill("Private practice");
  await page.getByRole("button", { name: "임시 저장" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  const id = page.url().split("/").at(-2)!;
  await page.getByRole("button", { name: "발행", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("발행했습니다");
  const other = await browser.newPage();
  await createVerifiedAccount(other);
  const status = await other.evaluate((postId) => fetch(`/api/posts/${postId}`).then((response) => response.status), id);
  expect(status).toBe(404);
  await other.close();
});
