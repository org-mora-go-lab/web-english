import { expect, test } from "@playwright/test";

test("비회원의 레슨 목록 방문은 데이터 요청 없이 로그인으로 안내한다", async ({ page }) => {
  const dataRequests: string[] = [];
  page.on("request", request => { if (/^\/api\/(ai|library|family)(\/|$)/.test(new URL(request.url()).pathname)) dataRequests.push(request.url()); });
  await page.goto("/library");
  await expect(page.getByRole("heading", { name: /로그인하고\s*영어 놀이를 시작해요/ })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "레슨 검색" })).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  expect(dataRequests).toEqual([]);
  await page.getByRole("link", { name: "로그인하고 대화하기" }).click();
  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Flibrary$/i);
  await expect(page.getByRole("button", { name: "로그인", exact: true })).toBeVisible();
});
