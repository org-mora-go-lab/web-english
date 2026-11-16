import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { seedConversation } from "./__util__";

test("내 대화를 삭제하면 새로고침해도 복원하지 않는다", async ({ page }) => {
  const account = await createAccount(page); const saved = await seedConversation(account.email);
  await page.goto("/ai"); await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "대화 삭제", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("combobox", { name: "내 대화 내역" })).toHaveValue("");
  expect((await page.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(404);
});
