import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("16~24개월 각각에 서로 다른 다섯 주제의 놀이를 8개씩 제공한다", async ({ page }) => {
  await createAccount(page);
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  const picker = page.getByRole("combobox", { name: "콘텐츠 개월수", exact: true });
  const allTitles: string[] = [];
  for (let age = 16; age <= 24; age++) {
    await picker.selectOption(String(age));
    await expect(page.getByRole("tab", { name: `${age}개월 놀이` })).toBeVisible();
    const cards = page.locator(".activity-grid").getByRole("button");
    await expect(cards).toHaveCount(8); await expect(cards.first()).toBeEnabled();
    const themes = await page.locator(".activity-grid .activity-theme").allTextContents();
    for (const theme of ["일상", "장난감", "그림책", "노래·몸짓", "산책"]) expect(themes.some(text => text.startsWith(theme))).toBe(true);
    allTitles.push(...await page.locator(".activity-card strong").allTextContents());
  }
  expect(allTitles).toHaveLength(72); expect(new Set(allTitles).size).toBe(72);
});
