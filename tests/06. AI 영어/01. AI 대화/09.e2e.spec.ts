import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { aiModels } from "./__mock__";

test("AI 연결 미설정을 안내하고 재확인한 설정 상태를 반영한다", async ({ page }) => {
  await createAccount(page);
  let configured = false;
  await page.route("**/api/ai/models", (route) => route.fulfill({ json: { ...aiModels, configured } }));
  await page.goto("/ai");
  await expect(page.getByText("AI 연결을 준비하고 있어요.", { exact: true })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "보내기", exact: true })).toBeDisabled();

  configured = true;
  await page.getByRole("button", { name: "연결 상태 다시 확인", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
  await expect(page.getByText("AI 연결을 준비하고 있어요.", { exact: true })).toHaveCount(0);
  await page.getByRole("textbox", { name: "AI에게 보낼 메시지" }).fill("Hello");
  await expect(page.getByRole("button", { name: "보내기", exact: true })).toBeEnabled();
});
