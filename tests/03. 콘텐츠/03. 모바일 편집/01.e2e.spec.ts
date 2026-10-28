import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("스마트폰 너비에서 글을 작성하고 저장한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createVerifiedAccount(page);
  await page.goto("/studio/posts/new");
  await page.getByLabel("제목").fill("모바일 작성 글");
  await page.locator(".tiptap").fill("Mobile English practice");
  await page.getByRole("button", { name: "임시 저장" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  await expect(page.getByLabel("제목")).toBeVisible();
});
