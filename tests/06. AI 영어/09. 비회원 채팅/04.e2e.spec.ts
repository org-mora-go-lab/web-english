import { expect, test } from "@playwright/test";

test("비회원의 글 목록·상세·컨텍스트 주소는 로그인 안내를 먼저 표시한다", async ({ page }) => {
  for (const path of ["/posts", "/posts/guest-access-probe", "/posts/guest-access-probe/context"]) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: /로그인하고\s*영어 놀이를 시작해요/ })).toBeVisible();
    await expect(page.getByRole("article")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "로그인하고 대화하기" })).toHaveAttribute("href", `/login?callbackUrl=${encodeURIComponent(path)}`);
  }
});
