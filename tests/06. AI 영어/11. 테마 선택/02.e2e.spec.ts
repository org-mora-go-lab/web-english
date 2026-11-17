import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("저장한 테마를 새로고침과 다른 페이지에서도 복원한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  await page.getByRole("combobox", { name: "테마", exact: true }).selectOption("dark");
  await page.reload();
  await expect(page.getByRole("combobox", { name: "테마", exact: true })).toHaveValue("dark");
  await page.goto("/settings/account");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
