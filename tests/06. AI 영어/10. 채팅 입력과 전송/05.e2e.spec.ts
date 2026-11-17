import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("헤더의 콘텐츠 아이콘은 화면 안에 큰 중앙 팝업을 연다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(size);
    const header = (await page.locator(".play-header").boundingBox())!;
    expect(header.height).toBeCloseTo(46, 0);
    const icon = page.getByRole("button", { name: "콘텐츠", exact: true });
    await expect(icon).toHaveText(""); await expect(icon.locator("svg")).toHaveCount(1);
    await icon.click();
    const dialog = page.getByRole("dialog", { name: "영어 학습 콘텐츠", exact: true });
    await expect(dialog).toBeInViewport();
    const bounds = (await dialog.boundingBox())!;
    expect(bounds.width).toBeGreaterThan(size.width > 700 ? 800 : size.width - 60);
    expect(bounds.height).toBeGreaterThan(size.height * .7);
    expect(Math.abs(bounds.x + bounds.width / 2 - size.width / 2)).toBeLessThan(2);
    await page.keyboard.press("Escape"); await expect(dialog).toBeHidden();
    expect((await page.locator(".play-header").boundingBox())!.y).toBe(header.y);
  }
});
