import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("사이드바에서 블랙과 라이트 색상을 전환한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  const picker = page.getByRole("combobox", { name: "테마", exact: true });
  await picker.selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator(".family-hub")).toHaveCSS("background-color", "rgb(14, 14, 14)");
  await picker.selectOption("light");
  await expect(page.locator(".family-hub")).toHaveCSS("background-color", "rgb(252, 252, 252)");
});
