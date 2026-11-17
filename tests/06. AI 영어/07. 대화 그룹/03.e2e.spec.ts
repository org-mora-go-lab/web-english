import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";
import { createProject } from "./__util__";

test("대화를 프로젝트로 이동하면 다시 접속해도 같은 그룹에 있다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  const saved = await seedConversation(account.email, "바다 동물 영어"); const project = await createProject(page, "동물 놀이");
  await expect(page.getByRole("combobox", { name: "바다 동물 영어 프로젝트 이동", exact: true })).toBeHidden();
  await page.reload();
  await page.getByLabel("바다 동물 영어 대화 메뉴", { exact: true }).click();
  await page.getByRole("combobox", { name: "바다 동물 영어 프로젝트 이동", exact: true }).selectOption(project.id);
  await expect.poll(async () => (await (await page.request.get(`/api/ai/conversations/${saved.id}`)).json()).conversation.projectId).toBe(project.id);
  await expect(page.getByRole("combobox", { name: "바다 동물 영어 프로젝트 이동", exact: true })).toBeHidden();
  await page.reload();
  await page.getByLabel("바다 동물 영어 대화 메뉴", { exact: true }).click();
  await expect(page.getByRole("combobox", { name: "바다 동물 영어 프로젝트 이동", exact: true })).toHaveValue(project.id);
});
