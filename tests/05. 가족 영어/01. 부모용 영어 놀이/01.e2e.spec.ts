import { expect, test } from "@playwright/test";

test("첫 화면은 채팅 안에서 고양이와 준비 단계 놀이를 안내한다", async ({ page }) => {
  await page.goto("/");
  const log = page.getByRole("log", { name: "AI 대화" });
  await expect(log.getByRole("heading", { name: "야옹! 나랑 같이 놀자." })).toBeVisible();
  await expect(log.getByRole("button", { name: "고양이 야옹 소리 듣기" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toBeInViewport();
  await log.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
  const card = log.getByRole("article", { name: "손 흔들며 인사 학습 카드" });
  await expect(card).toBeVisible();
  await card.getByText("놀이 방법과 부모 가이드", { exact: true }).click();
  await expect(card).toContainText("아이가 따라 하지 않아도 괜찮아요.");
});
