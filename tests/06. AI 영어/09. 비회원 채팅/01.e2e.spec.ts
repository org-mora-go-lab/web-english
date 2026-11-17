import { expect, test } from "@playwright/test";

test("비회원 홈은 학습 공간 대신 로그인 안내만 표시한다", async ({ page }) => {
  const aiRequests: string[] = [];
  page.on("request", request => { if (new URL(request.url()).pathname.startsWith("/api/ai/")) aiRequests.push(request.url()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /로그인하고\s*영어 놀이를 시작해요/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "로그인하고 대화하기" })).toHaveAttribute("href", "/login?callbackUrl=%2F");
  await expect(page.getByRole("link", { name: /회원가입/ })).toHaveAttribute("href", "/signup");
  await expect(page.getByRole("textbox", { name: "AI에게 보낼 메시지" })).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "콘텐츠 메뉴" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "커리큘럼", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "새 채팅", exact: true })).toHaveCount(0);
  expect(aiRequests).toEqual([]);
});
