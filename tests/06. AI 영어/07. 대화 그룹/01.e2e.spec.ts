import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("사이드바에서 프로젝트를 만들면 새로고침 후에도 유지된다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  await page.getByRole("button", { name: "새 프로젝트", exact: true }).click();
  await page.getByRole("textbox", { name: "프로젝트 이름", exact: true }).fill("동물과 인사");
  await page.getByRole("button", { name: "프로젝트 만들기", exact: true }).click();
  await expect(page.getByRole("button", { name: "동물과 인사", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "동물과 인사", exact: true })).toBeVisible();
  const response = await page.request.get("/api/ai/projects");
  expect((await response.json()).projects).toEqual([expect.objectContaining({ name: "동물과 인사" })]);
});
