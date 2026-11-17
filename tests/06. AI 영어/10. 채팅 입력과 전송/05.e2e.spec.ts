import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("작은 고정 헤더 아래로 콘텐츠가 남은 높이를 채운다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page); await createAccount(page);
  const header = (await page.locator(".play-header").boundingBox())!;
  const menu = (await page.getByRole("button", { name: "메뉴 열기" }).boundingBox())!;
  const title = (await page.locator(".play-header-title").boundingBox())!;
  const content = (await page.getByRole("button", { name: "콘텐츠", exact: true }).boundingBox())!;
  expect(header.height).toBeCloseTo(46, 0);
  expect(Math.abs(title.x + title.width / 2 - 195)).toBeLessThan(1);
  expect(menu.x + menu.width).toBeLessThan(title.x);
  expect(title.x + title.width).toBeLessThan(content.x);
  const contentButton = page.getByRole("button", { name: "콘텐츠", exact: true });
  await expect(contentButton).toHaveText("");
  await expect(contentButton.locator("svg")).toHaveCount(1);
  await contentButton.click();
  const panel = (await page.getByRole("main", { name: "영어 학습 콘텐츠" }).boundingBox())!;
  const footer = (await page.locator(".ai-chat-composer").boundingBox())!;
  expect(panel.y).toBeCloseTo(header.y + header.height, 0);
  expect(panel.y + panel.height).toBeCloseTo(footer.y, 0);
  await page.getByRole("main", { name: "영어 학습 콘텐츠" }).evaluate(element => { element.scrollTop = element.scrollHeight; });
  expect((await page.locator(".play-header").boundingBox())!.y).toBe(header.y);
});
