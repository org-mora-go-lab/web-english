import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";

test("삭제 중 새 채팅과 입력을 잠가 늦은 삭제가 다음 대화를 지우지 않는다", async ({page}) => {
  await mockAiModels(page); const account = await createAccount(page);
  const saved = await seedConversation(account.email, "삭제 응답 대기 대화");
  await page.reload();
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route(`**/api/ai/conversations/${saved.id}`, async route => {
    if (route.request().method() !== "DELETE") { await route.continue(); return; }
    await held; await route.fulfill({response: await route.fetch()});
  });
  await page.getByLabel("삭제 응답 대기 대화 대화 메뉴", {exact: true}).click();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", {name: "삭제 응답 대기 대화 대화 삭제", exact: true}).click();
  try {
  await expect(page.getByRole("button", {name: "새 채팅", exact: true})).toBeDisabled();
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeDisabled();
  } finally { release(); }
  await expect(page.getByRole("button", {name: "새 채팅", exact: true})).toBeEnabled();
  await expect(page.getByRole("textbox", {name: "AI에게 보낼 메시지"})).toBeEnabled();
  await expect(page.getByRole("button", {name: "삭제 응답 대기 대화", exact: true})).toHaveCount(0);
});
