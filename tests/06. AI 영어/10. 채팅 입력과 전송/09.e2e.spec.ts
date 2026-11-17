import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("드롭다운 항목 선택 후 선택창의 초점을 해제한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  const model = page.getByRole("combobox", { name: "AI 모델", exact: true });
  await expect(model).toBeEnabled(); await model.focus(); await model.selectOption("gpt-6-sol");
  await expect(model).toHaveValue("gpt-6-sol"); await expect(model).not.toBeFocused();
  const voice = page.getByRole("combobox", { name: "목소리", exact: true });
  await voice.focus(); await voice.selectOption("cat");
  await expect(voice).toHaveValue("cat"); await expect(voice).not.toBeFocused();
  await expect(page.locator(".ai-chat-voice-label")).toHaveText("고양이");
  const theme = page.getByRole("combobox", { name: "테마", exact: true });
  await theme.focus(); await theme.selectOption("dark");
  await expect(theme).not.toBeFocused();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
