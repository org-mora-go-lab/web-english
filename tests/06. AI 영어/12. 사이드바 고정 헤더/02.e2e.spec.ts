import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("AI 메뉴를 스크롤해도 상단 메뉴와 Mora를 고정한다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page); await page.goto("/ai");
  await page.setViewportSize({ width: 390, height: 360 });
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
  const sidebar = page.getByRole("complementary", { name: "대화 설정 및 내역" });
  const header = sidebar.locator(".ai-chat-sidebar-header");
  const brand = header.getByRole("link", { name: "Mora 홈" });
  const menu = page.getByRole("button", { name: "메뉴 닫기", exact: true });
  await expect(brand).toBeInViewport();
  await expect.poll(async () => Math.abs((await sidebar.boundingBox())!.x)).toBeLessThan(1);
  await expect(page.getByRole("button", { name: "메뉴 열기", exact: true })).toBeHidden();
  await expect(sidebar.locator(".lucide-menu")).toHaveCount(0);
  await expect(menu.locator("svg")).toHaveCount(1);
  const before = (await header.boundingBox())!;
  const body = sidebar.locator(".ai-chat-sidebar-body");
  await body.evaluate(element => { element.scrollTop = element.scrollHeight; });
  await expect.poll(() => body.evaluate(element => element.scrollTop)).toBeGreaterThan(0);
  await expect(brand).toBeInViewport(); await expect(menu).toBeInViewport();
  expect((await header.boundingBox())!.y).toBeCloseTo(before.y, 0);
  expect((await brand.boundingBox())!.x).toBeLessThan((await menu.boundingBox())!.x);
  await menu.click();
  await expect(page.getByRole("button", { name: "메뉴 열기", exact: true })).toBeVisible();
});
