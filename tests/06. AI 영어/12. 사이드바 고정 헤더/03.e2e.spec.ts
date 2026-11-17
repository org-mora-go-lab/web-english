import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("배포용 CSS의 상하단 안개 효과가 실제로 흐려지고 입력을 가로막지 않는다", async ({ page }) => {
  await mockAiModels(page); await createAccount(page);
  const edges = await page.locator(".ai-chat-log-area").evaluate(element => ["::before", "::after"].map(edge => {
    const style = getComputedStyle(element, edge);
    return { filter: style.backdropFilter || style.getPropertyValue("-webkit-backdrop-filter"), pointerEvents: style.pointerEvents };
  }));
  for (const edge of edges) {
    expect(edge.filter).toContain("blur(");
    expect(edge.pointerEvents).toBe("none");
  }
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toBeEnabled();
  await input.click(); await input.fill("Hello, little cat!");
  await expect(input).toHaveValue("Hello, little cat!");
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  await expect(page.getByRole("main", { name: "영어 학습 콘텐츠" })).toBeVisible();
});
