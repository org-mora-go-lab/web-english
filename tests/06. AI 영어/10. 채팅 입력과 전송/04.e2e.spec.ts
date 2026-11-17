import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";

test("전송 안내는 푸터 대신 사이드바 정책에서 확인한다", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockAiModels(page); await createAccount(page);
  const privacy = page.getByText("입력한 대화는 답변 생성을 위해 OpenAI로 전송됩니다. 아이의 이름 등 개인정보는 입력하지 마세요.", { exact: true });
  await expect(page.locator(".ai-chat-privacy")).toHaveCount(0);
  await expect(privacy).not.toBeVisible();
  await page.getByRole("button", { name: "메뉴 열기" }).click();
  await page.getByText("정책", { exact: true }).click();
  await expect(privacy).toBeVisible();
});
