import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";

test("사이드바에서 대화를 삭제하면 목록과 저장 데이터에서 제거된다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page); const saved = await seedConversation(account.email, "삭제할 인사 대화");
  await page.reload();
  await page.getByLabel("삭제할 인사 대화 대화 메뉴", { exact: true }).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "삭제할 인사 대화 대화 삭제", exact: true }).click();
  await expect(page.getByRole("button", { name: "삭제할 인사 대화", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "삭제할 인사 대화", exact: true })).toHaveCount(0);
  expect((await page.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(404);
});
