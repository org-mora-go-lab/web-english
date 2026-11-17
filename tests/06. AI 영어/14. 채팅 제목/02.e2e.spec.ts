import { randomUUID } from "node:crypto";

import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";

import { createAccount } from "../../__util__";
import { mockAiModels } from "../01. AI 대화/__mock__";
import { seedConversation } from "../03. 대화 저장/__util__";

test("기존 콘텐츠 요청 제목을 본문과 정렬을 보존하며 DB에도 정리한다", async ({ page }) => {
  await mockAiModels(page); const account = await createAccount(page);
  const raw = '영어 학습 콘텐츠 “손 흔들며 인사”로 대화를 시작해 주세요. 대상은 16개월 아이의 부모입니다.\n[MORA_PLAY:hello-wave]';
  const saved = await seedConversation(account.email, raw);
  const db = createClient({ url: "file:./.tmp/e2e.sqlite" });
  try {
    const before = (await db.execute({ sql: "SELECT messages_json,updated_at FROM ai_conversations WHERE id=?", args: [saved.id] })).rows[0];
    const otherUser = randomUUID(); const otherChat = randomUUID();
    await db.execute({ sql: "INSERT INTO users(id,email,display_name,password_hash,role,status,created_at,updated_at) VALUES(?,?,'Other','test','user','active',0,0)", args: [otherUser, `${otherUser}@example.test`] });
    await db.execute({ sql: "INSERT INTO ai_conversations(id,user_id,title,mode,model,messages_json,revision,last_turn_id,created_at,updated_at) VALUES(?,?,?,'parent','gpt-6-luna',?,1,?,0,0)", args: [otherChat, otherUser, raw, before.messages_json, randomUUID()] });
    await page.reload();
    await expect(page.getByRole("button", { name: "손 흔들며 인사", exact: true })).toBeVisible();
    await expect(page.locator(".play-header-title")).toHaveText("손 흔들며 인사");
    const after = (await db.execute({ sql: "SELECT title,messages_json,updated_at FROM ai_conversations WHERE id=?", args: [saved.id] })).rows[0];
    expect(after.title).toBe("손 흔들며 인사"); expect(after.messages_json).toBe(before.messages_json); expect(after.updated_at).toBe(before.updated_at);
    expect((await db.execute({ sql: "SELECT title FROM ai_conversations WHERE id=?", args: [otherChat] })).rows[0].title).toBe(raw);
    await page.reload(); await expect(page.getByRole("button", { name: "손 흔들며 인사", exact: true })).toBeVisible();
  } finally { db.close(); }
});
