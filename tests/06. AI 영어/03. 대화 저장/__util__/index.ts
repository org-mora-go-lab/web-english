import { randomUUID } from "node:crypto";

import { createClient } from "@libsql/client";

export async function seedConversation(email: string, title = "공놀이 영어", replySuggestion?: string) {
  const client = createClient({ url: "file:./.tmp/e2e.sqlite", timeout: 5000 });
  try {
    const account = await client.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
    const id = randomUUID();
    const messages = [{ id: randomUUID(), role: "user", content: title }, { id: randomUUID(), role: "assistant", content: "Roll the ball!", replySuggestion, model: "gpt-6-luna" }];
    await client.execute({ sql: "INSERT INTO ai_conversations (id, user_id, title, mode, model, messages_json, revision, last_turn_id, created_at, updated_at) VALUES (?, ?, ?, 'parent', 'gpt-6-luna', ?, 1, ?, ?, ?)", args: [id, String(account.rows[0].id), title, JSON.stringify(messages), randomUUID(), Date.now(), Date.now()] });
    return { id, messages };
  } finally { client.close(); }
}
