import { expect, test } from "@playwright/test";

import { createVerifiedAccount, login, waitForMail } from "../../__util__";

test("닉네임과 이메일을 변경한다", async ({ page }) => {
  const { password } = await createVerifiedAccount(page);
  const email = `changed-${Date.now()}@example.test`;
  await page.goto("/settings/account");
  await page.getByLabel("닉네임").fill("새 닉네임");
  await page.getByRole("button", { name: "저장", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("저장했습니다");
  await page.getByLabel("새 이메일").fill(email);
  await page.getByRole("button", { name: "인증 메일 보내기" }).click();
  await expect(page.getByRole("status")).toContainText("인증 이메일");
  await page.goto(await waitForMail(email, "Mora English 새 이메일 인증"));
  await expect(page.getByRole("status")).toContainText("인증이 완료");
  await login(page, email, password);
  await expect(page.getByRole("heading", { name: "새 닉네임님의 스튜디오" })).toBeVisible();
});
