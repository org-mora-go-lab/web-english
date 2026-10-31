import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("다른 부모의 놀이 기록은 조회와 삭제가 차단된다", async ({ browser }) => {
  const first = await browser.newContext(); const second = await browser.newContext();
  const a = await first.newPage(); const b = await second.newPage();
  try {
    await createAccount(a); await a.goto("/");
    await a.getByRole("button", { name: /오늘의 놀이 보기/ }).click();
    await a.getByRole("textbox", { name: "한 줄 메모" }).fill("첫 계정 비밀 기록");
    await a.getByRole("button", { name: "놀이 기록 저장" }).click();
    const data = await a.evaluate(async () => (await fetch("/api/family")).json());
    await createAccount(b); await b.goto("/");
    await b.getByRole("button", { name: "놀이 기록" }).click();
    await expect(b.getByText("첫 계정 비밀 기록")).toHaveCount(0);
    const deleted = await b.evaluate(async id => fetch(`/api/family?id=${id}`, { method: "DELETE" }).then(r => r.status), data.records[0].id);
    expect(deleted).toBe(404);
  } finally { await first.close(); await second.close(); }
});
