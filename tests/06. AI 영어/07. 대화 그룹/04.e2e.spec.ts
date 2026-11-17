import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";
import { createProject, moveConversation } from "./__util__";

test("프로젝트를 삭제해도 대화는 미분류에 남는다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  const saved = await seedConversation(account.email, "남겨 둘 동물 대화"); const project = await createProject(page, "삭제할 프로젝트");
  await moveConversation(page, saved.id, project.id); await page.reload();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: "삭제할 프로젝트 프로젝트 삭제", exact: true }).click();
  await expect(page.getByRole("button", { name: "삭제할 프로젝트", exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("button", { name: "남겨 둘 동물 대화", exact: true })).toBeVisible();
  const response = await page.request.get(`/api/ai/conversations/${saved.id}`);
  expect(response.status()).toBe(200); expect((await response.json()).conversation.projectId).toBeNull();
});
