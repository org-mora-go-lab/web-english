import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "./__util__";

test("불러오는 중 새 채팅을 만들면 이전 조회를 취소한다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  const saved = await seedConversation(account.email, "불러올 놀이");
  await page.reload(); await waitForChatControls(page);
  const data = await (await page.request.get(`/api/ai/conversations/${saved.id}`)).json();
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**/api/ai/conversations/${saved.id}`, async route => { await held; await route.fulfill({ json: data }).catch(() => {}); });
  const entry = page.getByRole("button", { name: "불러올 놀이", exact: true });
  await entry.click(); await expect(entry).toHaveAttribute("aria-busy", "true");
  await page.getByRole("button", { name: "새 채팅", exact: true }).click();
  await expect(page.locator(".play-header-title")).toHaveText("새 채팅");
  release();
  await expect(entry).toHaveAttribute("aria-busy", "false");
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeEnabled();
});
