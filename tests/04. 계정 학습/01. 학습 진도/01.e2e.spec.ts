import { expect, test } from "@playwright/test";

import { createVerifiedAccount, login } from "../../__util__";

test("글 학습 진도가 다른 브라우저에 동기화된다", async ({ browser, page }) => {
  const { email, password } = await createVerifiedAccount(page);
  const created = await page.evaluate(async () => {
    const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "진도 테스트 글", contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Hello world" }] }] }, level: "beginner", visibility: "public" }) });
    return response.json();
  });
  await page.goto(`/learn/${created.post.id}`);
  await page.getByRole("button", { name: "학습 완료 저장" }).click();
  await expect(page.getByRole("status")).toContainText("학습 완료");
  const other = await browser.newPage();
  await login(other, email, password);
  await other.goto("/learn/progress");
  await expect(other.getByText("진도 테스트 글")).toBeVisible();
  await expect(other.getByText(/완료/)).toBeVisible();
  await other.close();
});
