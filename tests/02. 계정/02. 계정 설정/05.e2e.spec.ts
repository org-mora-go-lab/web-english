import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("잘못된 탈퇴 비밀번호는 모달 안에 오류를 표시하고 계정을 보존한다", async ({ page }) => {
  await createAccount(page); await page.goto("/settings/account");
  await page.getByRole("button", { name: "회원 탈퇴", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "회원 탈퇴", exact: true });
  await dialog.getByLabel("탈퇴 확인 비밀번호").fill("WrongPassword123!");
  await dialog.getByLabel("DELETE 입력").fill("DELETE");
  await dialog.getByRole("button", { name: "계정과 데이터 삭제", exact: true }).click();
  await expect(dialog.getByRole("alert")).toBeVisible();
  await expect(dialog).toBeVisible();
  expect((await page.request.get("/api/account")).ok()).toBe(true);
});
