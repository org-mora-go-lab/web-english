import { randomUUID } from "node:crypto";

import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";

test("이전 프로필과 과거 기록은 유지하고 화면의 개월수만 지원 범위로 표시한다", async ({ page }) => {
  const account = await createAccount(page);
  const db = createClient({ url: "file:./.tmp/e2e.sqlite" });
  try {
    const userId = String((await db.execute({ sql: "SELECT id FROM users WHERE email=?", args: [account.email] })).rows[0].id);
    await db.execute({ sql: "INSERT INTO child_profiles(id,user_id,age_months,created_at,updated_at) VALUES(?,?,36,0,0)", args: [randomUUID(), userId] });
    await db.execute({ sql: "INSERT INTO play_records(id,user_id,activity_id,age_months,reaction,note,played_at,created_at) VALUES(?,?,?,36,'enjoyed','예전 놀이 기억',0,0)", args: [randomUUID(), userId, "36-choose-play"] });
    await page.reload(); await expect(page.getByRole("combobox", { name: "아이 개월수", exact: true })).toHaveValue("24");
    await page.getByRole("button", { name: "콘텐츠", exact: true }).click(); await page.getByRole("tab", { name: "놀이 기록", exact: true }).click();
    await expect(page.getByText("예전 놀이 기억", { exact: false })).toBeVisible();
    await expect(page.getByRole("heading", { name: "오늘 놀이 고르기", exact: true })).toBeVisible();
    expect((await db.execute({ sql: "SELECT age_months FROM child_profiles WHERE user_id=?", args: [userId] })).rows[0].age_months).toBe(36);
  } finally { db.close(); }
});
