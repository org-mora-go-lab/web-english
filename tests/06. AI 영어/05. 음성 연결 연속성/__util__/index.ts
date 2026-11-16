import { randomUUID } from "node:crypto";

import { createClient } from "@libsql/client";

export const voiceInput = (conversationId = randomUUID(), revision = 0) => ({ sdp: "v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111\r\n", conversationId, revision, mode: "parent", voice: "marin" });

export async function seedLongVoiceConversation(email: string) {
  const client = createClient({ url: "file:./.tmp/e2e.sqlite" });
  try {
    const account = await client.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
    const id = randomUUID();
    const messages = Array.from({ length: 202 }, (_, index) => ({ id: randomUUID(), role: index % 2 ? "assistant" : "user", content: `Turn ${index}` }));
    await client.execute({ sql: "INSERT INTO ai_conversations (id, user_id, title, mode, model, messages_json, revision, last_turn_id, created_at, updated_at) VALUES (?, ?, 'Long voice chat', 'parent', 'gpt-realtime-2.1', ?, 101, ?, ?, ?)", args: [id, String(account.rows[0].id), JSON.stringify(messages), randomUUID(), Date.now(), Date.now()] });
    return id;
  } finally { client.close(); }
}

export async function seedEndedVoice(email: string, renewable = false, reused = false) {
  const client = createClient({ url: "file:./.tmp/e2e.sqlite" });
  try {
    const account = await client.execute({ sql: "SELECT id FROM users WHERE email = ?", args: [email] });
    const id = randomUUID(); const conversationId = randomUUID();
    const insert = async (sessionId: string, parent: string | null) => client.execute({
      sql: "INSERT INTO ai_voice_sessions (id, user_id, conversation_id, call_id, mode, revision, status, renewable, continuation_of, created_at, expires_at) VALUES (?, ?, ?, 'rtc_test', 'parent', 0, 'ended', ?, ?, ?, ?)",
      args: [sessionId, String(account.rows[0].id), conversationId, Number(renewable), parent, Date.now(), Date.now() + 210_000],
    });
    await insert(id, null);
    if (reused) await insert(randomUUID(), id);
    return { ...voiceInput(conversationId), continuationOf: id };
  } finally { client.close(); }
}
