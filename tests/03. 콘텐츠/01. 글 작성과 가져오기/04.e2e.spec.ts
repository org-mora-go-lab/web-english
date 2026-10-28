import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("Paul JSON을 비공개 글로 가져온다", async ({ page }) => {
  await createAccount(page);
  await page.goto("/studio/import");
  await page.getByLabel("가져오기 형식").selectOption("json");
  await page.getByLabel("가져올 콘텐츠").fill(JSON.stringify({ title: "Travel English", contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Where is the station?" }] }] } }));
  await page.getByRole("button", { name: "비공개 글로 가져오기" }).click();
  await expect(page).toHaveURL(/\/studio\/posts\/.+\/edit/);
  await expect(page.getByLabel("제목")).toHaveValue("Travel English");
});
