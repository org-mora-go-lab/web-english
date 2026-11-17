import { expect, type Page } from "@playwright/test";

export async function openChatOptions(page: Page) {
  const options = page.getByRole("button", { name: "대화 옵션", exact: true });
  await expect(options).toBeVisible();
  if (await options.getAttribute("aria-expanded") !== "true") await options.click();
  await expect(options).toHaveAttribute("aria-expanded", "true");
}
