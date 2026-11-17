import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "./__util__";

test("대화의 추천 답변은 다시 접속해도 복원하고 새 채팅에서는 초기화한다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  await seedConversation(account.email, "색깔 영어", "It's a yellow ball.");
  await page.reload();
  const input = page.getByRole("textbox", { name: "AI에게 보낼 메시지" });
  await expect(input).toHaveAttribute("placeholder", "It's a yellow ball.");
  await page.reload(); await expect(input).toHaveAttribute("placeholder", "It's a yellow ball.");
  await page.getByRole("button", { name: "새 채팅", exact: true }).click();
  await expect(input).toHaveAttribute("placeholder", "공놀이할 때 아이에게 무슨 영어를 해주면 좋을까요?");
});
