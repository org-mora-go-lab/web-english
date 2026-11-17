import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { createProject } from "./__util__";

test("프로젝트 이름 변경은 새로고침 후에도 유지된다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page); await createProject(page, "인사 영어"); await page.reload();
  await page.getByRole("button", { name: "인사 영어 프로젝트 이름 변경", exact: true }).click();
  await page.getByRole("textbox", { name: "프로젝트 이름", exact: true }).fill("가족 인사 영어");
  await page.getByRole("button", { name: "프로젝트 이름 저장", exact: true }).click();
  await expect(page.getByRole("button", { name: "가족 인사 영어", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "가족 인사 영어", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "인사 영어", exact: true })).toHaveCount(0);
});
