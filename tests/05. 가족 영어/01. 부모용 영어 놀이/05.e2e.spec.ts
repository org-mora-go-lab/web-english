import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

 test("부모 가이드는 콘텐츠와 개별 놀이 안에서 안내한다", async ({ page }) => {
  await createAccount(page);
  await page.getByRole("button", { name: "콘텐츠", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "영어 학습 콘텐츠", exact: true });
  await expect(panel).toContainText("따라 말하기나 정답을 요구하지 않고");
  await panel.getByRole("button", { name: /손 흔들며 인사/ }).click();
  const card = page.getByRole("article", { name: "손 흔들며 인사 학습 카드" });
  await card.getByText("놀이 방법과 부모 가이드", { exact: true }).click();
  await expect(card).toContainText("아이가 따라 하지 않아도 괜찮아요.");
});
