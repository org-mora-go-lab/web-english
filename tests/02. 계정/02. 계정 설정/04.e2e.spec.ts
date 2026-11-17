import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("계정 하단 링크에서만 탈퇴 창을 열고 취소하면 입력을 지운다", async ({ page }) => {
  await createAccount(page); await page.goto("/settings/account");
  let requests = 0;
  page.on("request", request => { if (request.method() === "DELETE" && request.url().endsWith("/api/account")) requests++; });
  const link = page.getByRole("button", { name: "회원 탈퇴", exact: true });
  const dialog = page.getByRole("dialog", { name: "회원 탈퇴", exact: true });
  await expect(dialog).toBeHidden();
  expect(await link.evaluate(element => getComputedStyle(element).textDecorationLine)).toContain("underline");
  await link.click(); await expect(dialog).toBeVisible();
  await expect(dialog).toContainText("복구할 수 없습니다");
  await dialog.getByRole("textbox", { name: "DELETE 입력", exact: true }).fill("DELETE");
  await dialog.getByRole("button", { name: "취소", exact: true }).click();
  await expect(dialog).toBeHidden(); await expect(link).toBeFocused();
  await link.click(); await expect(dialog.getByLabel("DELETE 입력", { exact: true })).toBeEmpty();
  await page.keyboard.press("Escape"); await expect(dialog).toBeHidden();
  expect(requests).toBe(0);
});
