import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
test("다른 창에서 저장한 기록을 새로고침으로 동기화", async ({ page, context }) => {
  await createAccount(page);
  await page.goto("/library");
  const other = await context.newPage();
  await other.goto("/library");
  await page.getByRole("button", { name: "저장한 레슨", exact: true }).click();
  const saved = other.waitForResponse(response => response.url().endsWith("/api/library") && response.request().method() === "PUT" && response.ok());
  await other
    .getByRole("button", {
      name: "어색한 침묵은 이제 그만, 스몰토크 시작하기 저장",
      exact: true,
    })
    .click();
  await saved;
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(1);
  const removed = other.waitForResponse(response => response.url().endsWith("/api/library") && response.request().method() === "PUT" && response.ok());
  await other
    .getByRole("button", { name: /스몰토크 시작하기 저장 취소/ })
    .click();
  await removed;
  await page.reload();
  await expect(page.getByRole("article")).toHaveCount(0);
});
