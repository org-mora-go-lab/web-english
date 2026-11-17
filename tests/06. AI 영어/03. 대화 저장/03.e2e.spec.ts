import { expect, test } from "@playwright/test";

import { createAccount, waitForChatControls } from "../../__util__";
import { seedEndedVoice } from "../05. 음성 연결 연속성/__util__";
import { seedConversation } from "./__util__";

test("내 대화를 삭제하면 새로고침해도 복원하지 않는다", async ({ page, baseURL }) => {
  const account = await createAccount(page); const saved = await seedConversation(account.email);
  const voice = await seedEndedVoice(account.email, false, false, saved.id);
  await page.goto("/ai"); await expect(page.getByTestId("ai-message-assistant")).toBeVisible();
  page.once("dialog", dialog => dialog.accept());
  await waitForChatControls(page);
  await page.getByRole("button", { name: "대화 삭제", exact: true }).click();
  await expect(page.getByTestId("ai-message-assistant")).toHaveCount(0);
  await page.reload();
  await waitForChatControls(page);
  await expect(page.getByRole("combobox", { name: "내 대화 내역" })).toHaveValue("");
  expect((await page.request.get(`/api/ai/conversations/${saved.id}`)).status()).toBe(404);
  const removedVoice = await page.request.post(`/api/ai/realtime/${voice.continuationOf}/observe`, { headers: { origin: baseURL! }, data: { previousObserverId: crypto.randomUUID() } });
  expect(removedVoice.status()).toBe(404);
});
