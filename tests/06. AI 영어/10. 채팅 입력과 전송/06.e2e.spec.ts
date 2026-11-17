import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("PC 메뉴를 접고 다시 열어도 입력한 문장을 유지한다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await mockAiModels(page); await createAccount(page);
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  await input.fill("우리 아이가 좋아하는 동물로 놀고 싶어요.");
  await page.getByRole("button", { name: "메뉴 닫기", exact: true }).click();
  await expect.poll(async () => (await page.locator(".family-content").boundingBox())!.x).toBeLessThan(1);
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
  await expect(page.getByRole("button", { name: "새 채팅", exact: true })).toBeInViewport();
  await expect(input).toHaveValue("우리 아이가 좋아하는 동물로 놀고 싶어요.");
});
