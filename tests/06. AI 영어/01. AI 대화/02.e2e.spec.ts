import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "./__mock__";

test("선택한 AI 모델을 새로고침 후 복원한다", async ({ page }) => {
  await createAccount(page);
  await mockAiModels(page);
  await page.goto("/ai");
  await waitForChatControls(page);
  await page.getByRole("combobox", { name: "AI 모델" }).selectOption("gpt-6-astra");
  await page.reload();
  await waitForChatControls(page);
  await expect(page.getByRole("combobox", { name: "AI 모델" })).toHaveValue("gpt-6-astra");
});
