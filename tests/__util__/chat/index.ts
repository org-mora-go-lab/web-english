import { expect, type Page } from "@playwright/test";

export async function waitForChatControls(page: Page) {
  await expect(page.getByRole("combobox", { name: "AI 모델", exact: true })).toBeVisible();
}
