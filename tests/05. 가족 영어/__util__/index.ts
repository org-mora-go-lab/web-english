import type { Page } from "@playwright/test";

export async function openPlay(page: Page, title = "손 흔들며 인사") {
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  await page.getByRole("dialog", { name: "영어 학습 콘텐츠", exact: true }).getByRole("button", { name: new RegExp(title) }).click();
}
