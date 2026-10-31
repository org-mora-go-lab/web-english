import { expect, test } from "@playwright/test";
test("이해도 확인 피드백", async ({ page }) => {
  await page.goto("/library");
  await page.getByRole("link", { name: "오늘의 레슨 시작하기" }).click();
  const quiz = page.getByRole("group", { name: "03. 이해도 확인" });
  await quiz
    .getByRole("button", { name: /What time does the meeting start/ })
    .click();
  await expect(quiz.getByRole("status")).toContainText("다시 생각해 보세요");
  await quiz.getByRole("button", { name: /How was your weekend/ }).click();
  await expect(quiz.getByRole("status")).toContainText("정답이에요");
  await expect(quiz.getByRole("status")).toContainText(
    "부담 없이 일상 이야기를 시작",
  );
});
