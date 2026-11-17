import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../../06. AI 영어/01. AI 대화/__mock__";

test("스마트폰 화면에서 메뉴와 놀이 카드를 사용할 수 있다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page);
  await createAccount(page);
  await page.getByRole("button", {name: "메뉴 열기"}).click();
  const sidebar = page.getByRole("complementary", { name: "콘텐츠 메뉴" });
  await expect.poll(async () => Math.abs((await sidebar.boundingBox())!.x)).toBeLessThan(1);
  expect((await sidebar.boundingBox())!.width).toBeCloseTo(308, 0);
  expect(await sidebar.evaluate(element => getComputedStyle(element).transitionProperty)).toContain("transform");
  await expect(page.getByRole("button", { name: "부모 가이드", exact: true })).toBeVisible();
  await page.getByRole("button", {name: "메뉴 닫기"}).click();
  await expect(page.getByRole("button", { name: "고양이 야옹 소리 듣기" })).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});
