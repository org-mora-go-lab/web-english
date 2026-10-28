import { expect, test } from "@playwright/test";

import { createVerifiedAccount } from "../../__util__";

test("Paul Markdown을 비공개 글로 가져온다", async ({ page }) => {
  await createVerifiedAccount(page);
  await page.goto("/studio/import");
  await page.getByLabel("가져오기 형식").selectOption("markdown");
  await page.getByLabel("가져올 콘텐츠").fill("# Coffee English\n\nCan I get a coffee, please?");
  await page.getByRole("button", { name: "비공개 글로 가져오기" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  await expect(page.getByLabel("제목")).toHaveValue("Coffee English");
  await expect(page.getByLabel("공개 설정")).toHaveValue("private");
});
