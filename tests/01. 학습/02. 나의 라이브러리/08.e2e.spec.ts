import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("잘못된 레슨 ID 저장을 거절하고 기존 계정 기록을 보존한다", async ({ page, baseURL }) => {
  await createAccount(page);
  const valid = await page.request.put("/api/library", { headers: { Origin: baseURL! }, data: { saved: ["small-talk"], completed: [], history: [] } });
  expect(valid.ok()).toBe(true);
  const invalid = await page.request.put("/api/library", { headers: { Origin: baseURL! }, data: { saved: ["small-talk", "deleted"], completed: [], history: [] } });
  expect(invalid.status()).toBe(400);
  await page.goto("/library");
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText("스몰토크");
});
