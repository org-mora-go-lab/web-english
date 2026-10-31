import { expect, test } from "@playwright/test";

test("카카오 로그인 버튼이 카카오 인증을 시작한다", async ({ page }) => {
  await page.route("https://kauth.kakao.com/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<h1>Kakao authorization</h1>" }));
  await page.goto("/login");
  await expect(page.getByText("기존 이메일 계정과 자동으로 합쳐지지 않습니다.")).toBeVisible();
  await page.getByRole("button", { name: "카카오로 계속하기" }).click();
  await expect(page).toHaveURL(/kauth\.kakao\.com\/oauth\/authorize/);
  expect(new URL(page.url()).searchParams.get("scope")).toBe("profile_nickname,profile_image");
});
