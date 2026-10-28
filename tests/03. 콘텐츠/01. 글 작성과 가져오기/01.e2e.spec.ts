import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("글을 작성해 공개 발행한다", async ({ page }) => {
  await createVerifiedAccount(page);
  const title = `공개 학습 글 ${Date.now()}`;
  await page.goto("/studio/posts/new");
  await page.getByLabel("제목").fill(title);
  await page.locator(".tiptap").fill("Hello! Let's practice English.");
  await page.getByLabel("공개 설정").selectOption("public");
  await page.getByRole("button", { name: "임시 저장" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  await page.getByRole("button", { name: "발행", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("발행했습니다");
  await page.getByRole("link", { name: "스튜디오" }).click();
  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/login/);
  await page.goto("/posts");
  await page.getByRole("link", { name: new RegExp(title) }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});
