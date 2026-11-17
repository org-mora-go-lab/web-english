import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("사이드바에는 정책과 이전 학습 메뉴를 렌더링하지 않는다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page); await createAccount(page);
  await page.getByRole("button", { name: "메뉴 열기", exact: true }).click();
  const sidebar = page.getByRole("complementary", { name: "채팅 메뉴" });
  await expect(sidebar.getByRole("navigation")).toHaveCount(0);
  await expect(sidebar.getByText("정책", { exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole("link", { name: "AI 영어 도우미", exact: true })).toHaveCount(0);
  for (const name of ["오늘", "커리큘럼", "놀이 기록", "부모 가이드"]) await expect(sidebar.getByRole("button", { name, exact: true })).toHaveCount(0);
  await expect(sidebar.getByRole("button", { name: "새 채팅", exact: true })).toBeVisible();
  await expect(page.locator(".ai-chat-policy, .ai-chat-privacy")).toHaveCount(0);
});
