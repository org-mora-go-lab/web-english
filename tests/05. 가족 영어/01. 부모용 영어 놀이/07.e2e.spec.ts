import { expect, test } from "@playwright/test";

test("모든 개월수 단계에 다섯 주제의 놀이가 8개씩 있다", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "커리큘럼", exact: true }).click();

  for (const stage of ["16–17개월", "18–20개월", "21–23개월", "24–26개월", "27–29개월", "30–32개월", "33–35개월", "36개월"]) {
    await page.getByRole("tab", { name: stage }).click();
    const cards = page.locator(".activity-grid").getByRole("button");
    await expect(cards).toHaveCount(8);
    const themes = await page.locator(".activity-grid .activity-theme").allTextContents();
    for (const theme of ["일상", "장난감", "그림책", "노래·몸짓", "산책"]) {
      expect(themes.some(text => text.startsWith(theme)), `${stage}에 ${theme} 놀이가 없습니다.`).toBe(true);
    }
  }
});
