import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "./__util__";

test("채팅 제목만 반짝이고 늦은 조회가 새 선택을 덮어쓰지 않는다", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await mockAiModels(page); const account = await createAccount(page);
  const first = await seedConversation(account.email, "첫 번째 동물 놀이");
  const second = await seedConversation(account.email, "두 번째 색깔 놀이");
  await page.reload(); await waitForChatControls(page);
  const saved = await (await page.request.get(`/api/ai/conversations/${first.id}`)).json();
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**/api/ai/conversations/${first.id}`, async route => { await held; await route.fulfill({ json: saved }).catch(() => {}); });
  const firstButton = page.getByRole("button", { name: "첫 번째 동물 놀이", exact: true });
  const secondButton = page.getByRole("button", { name: "두 번째 색깔 놀이", exact: true });
  await firstButton.click();
  await expect(firstButton).toHaveAttribute("aria-busy", "true");
  expect(await firstButton.locator("span").evaluate(element => getComputedStyle(element).animationName)).toBe("conversation-title-shimmer");
  await expect(firstButton).toBeVisible(); await expect(secondButton).toBeVisible();
  await expect(page.locator(".conversation-sidebar")).not.toContainText("불러오는 중");
  await secondButton.click(); await expect(page.locator(".play-header-title")).toHaveText("두 번째 색깔 놀이");
  await expect(page.getByTestId("ai-message-user")).toContainText("두 번째 색깔 놀이");
  release();
  await expect(firstButton).toHaveAttribute("aria-busy", "false");
  await expect(page.locator(".play-header-title")).toHaveText("두 번째 색깔 놀이");
  expect((await (await page.request.get(`/api/ai/conversations/${second.id}`)).json()).conversation.title).toBe("두 번째 색깔 놀이");
});
