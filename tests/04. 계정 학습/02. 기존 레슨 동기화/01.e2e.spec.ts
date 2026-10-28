import { expect, test } from "@playwright/test";

import { createVerifiedAccount, login } from "../../__util__";

test("기존 영상 레슨 저장 기록이 계정 간 기기에 동기화된다", async ({ browser, page }) => {
  const { email, password } = await createVerifiedAccount(page);
  await page.goto("/watch/small-talk");
  await expect(page.getByRole("button", { name: "레슨 저장" })).toBeEnabled();
  const saved = page.waitForResponse(response => response.url().endsWith("/api/library") && response.request().method() === "PUT" && response.ok());
  await page.getByRole("button", { name: "레슨 저장" }).click();
  await saved;
  const other = await browser.newPage();
  await login(other, email, password);
  const library = await other.evaluate(() => fetch("/api/library").then(response => response.json()));
  expect(library.library.saved).toContain("small-talk");
  await other.close();
});
