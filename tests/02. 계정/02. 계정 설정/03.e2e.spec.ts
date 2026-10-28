import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("회원 탈퇴 시 글과 학습 데이터를 삭제한다", async ({ page }) => {
  const { password } = await createAccount(page);
  const created = await page.evaluate(async () => {
    const response = await fetch("/api/posts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: "삭제될 학습 글", contentJson: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Delete me" }] }] }, visibility: "public" }) });
    return response.json();
  });
  await page.evaluate(async id => { await fetch(`/api/posts/${id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publish: true }) }); await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: id, status: "completed" }) }); }, created.post.id);
  await page.goto("/settings/account");
  await page.getByLabel("탈퇴 확인 비밀번호").fill(password);
  await page.getByLabel("DELETE 입력").fill("DELETE");
  await page.getByRole("button", { name: "계정과 데이터 삭제" }).click();
  await expect(page).toHaveURL(/\/login/);
  const status = await page.evaluate((id) => fetch(`/api/posts/${id}`).then(response => response.status), created.post.id);
  expect(status).toBe(404);
});
