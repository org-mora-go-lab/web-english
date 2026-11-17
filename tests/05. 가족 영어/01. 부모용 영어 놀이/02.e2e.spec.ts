import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("현재 개월수는 16~24개월이며 한 달마다 다른 콘텐츠를 보여준다", async ({ page }) => {
  await createAccount(page);
  const age = page.getByRole("combobox", { name: "아이 개월수", exact: true });
  await expect(age.locator("option")).toHaveText(["16개월", "17개월", "18개월", "19개월", "20개월", "21개월", "22개월", "23개월", "24개월"]);
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  const picker = page.getByRole("combobox", { name: "콘텐츠 개월수", exact: true });
  const firstTitles = await page.locator(".activity-card strong").allTextContents();
  await picker.selectOption("17");
  await expect(page.getByRole("tab", { name: "17개월 놀이" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("button", { name: /인형에게 손 흔들기/ })).toBeEnabled();
  expect(await page.locator(".activity-card strong").allTextContents()).not.toEqual(firstTitles);
  await page.getByRole("button", { name: "학습 콘텐츠 닫기" }).click();
  await page.reload(); await expect(age).toHaveValue("17");
});
