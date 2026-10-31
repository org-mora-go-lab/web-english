import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("회원의 프로필 이름과 이미지가 홈과 스튜디오에 표시된다", async ({ page }) => {
  const account = await createAccount(page);
  const db = createClient({ url: "file:./.tmp/e2e.sqlite" });
  try {
    await db.execute({ sql: "UPDATE users SET display_name = ?, profile_image_url = ? WHERE email = ?", args: ["카카오 학습자", "https://k.kakaocdn.net/dn/example/profile.jpg", account.email] });
  } finally { db.close(); }
  await page.goto("/");
  await expect(page.getByRole("link", { name: "카카오 학습자 계정 설정" })).toBeVisible();
  await expect(page.locator(".home-account-link img")).toHaveAttribute("src", /k\.kakaocdn\.net/);
  await page.goto("/studio");
  await expect(page.getByLabel("로그인 사용자 카카오 학습자")).toBeVisible();
  await expect(page.locator("header img")).toHaveAttribute("src", /k\.kakaocdn\.net/);
});
