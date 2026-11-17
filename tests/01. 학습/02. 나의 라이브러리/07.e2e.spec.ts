import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("계정 기록 동기화 실패를 안내한다", async ({ page }) => {
  await createAccount(page);
  await page.route("**/api/library", async route => {
    if (route.request().method() === "PUT") await route.fulfill({ status: 503, json: { error: "일시적인 저장 오류" } });
    else await route.continue();
  });
  await page.goto("/library");
  await page.getByRole("button", { name: "어색한 침묵은 이제 그만, 스몰토크 시작하기 저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("서버에 동기화하지 못했습니다");
  await page.getByRole("button", { name: "저장한 레슨" }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
});
