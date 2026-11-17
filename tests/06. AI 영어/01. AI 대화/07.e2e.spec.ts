import { expect, test } from "@playwright/test";

import { createAccount, openChatOptions } from "../../__util__";
import { mockAiModels } from "./__mock__";

test("모바일 첫 화면에서 AI 대화에 진입하고 뒤로 돌아온다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await createAccount(page);
  await mockAiModels(page);
  await page.goto("/");
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeVisible();
  await page.getByRole("button", {name: "메뉴 열기"}).click();
  await page.getByRole("link", { name: "AI 영어 도우미", exact: true }).click();
  await expect(page).toHaveURL(/\/ai$/);
  await openChatOptions(page);
  await expect(page.getByRole("combobox", { name: "AI 모델" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeVisible();
});
