import "server-only";

import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";

import { getDb, schema } from "@/src/5-shared/db";

import { AiError } from "./server";
import type { AiChatInput, AiChatReply, AiConversation, SavedAiMessage } from "./type";
import { hangupRealtimeCall } from "./voice-call";

const table = schema.aiConversations;
type Row = typeof table.$inferSelect;
const view = (row: Row): AiConversation => ({ id: row.id, title: row.title, mode: row.mode, model: row.model, messages: JSON.parse(row.messagesJson), revision: row.revision, updatedAt: row.updatedAt });
const missing = () => new AiError("대화를 찾을 수 없습니다.", 404, "CONVERSATION_NOT_FOUND");
const conflict = () => new AiError("다른 창에서 대화가 변경됐어요. 대화 내역을 다시 불러와 주세요.", 409, "CONVERSATION_CONFLICT");

export async function getAiConversation(userId: string, id: string) {
  const row = await getDb().query.aiConversations.findFirst({ where: and(eq(table.id, id), eq(table.userId, userId)) });
  if (!row) throw missing();
  return view(row);
}

export async function listAiConversations(userId: string) {
  const rows = await getDb().select({ id: table.id, title: table.title, mode: table.mode, model: table.model, revision: table.revision, updatedAt: table.updatedAt })
    .from(table).where(eq(table.userId, userId)).orderBy(desc(table.updatedAt)).limit(100);
  return { conversations: rows, latest: rows[0] ? await getAiConversation(userId, rows[0].id) : null };
}

export async function deleteAiConversation(userId: string, id: string) {
  const removed = await getDb().delete(table).where(and(eq(table.id, id), eq(table.userId, userId))).returning({ id: table.id });
  if (!removed.length) throw missing();
  const calls = await getDb().delete(schema.aiVoiceSessions).where(and(eq(schema.aiVoiceSessions.userId, userId), eq(schema.aiVoiceSessions.conversationId, id))).returning({ callId: schema.aiVoiceSessions.callId, status: schema.aiVoiceSessions.status });
  await Promise.allSettled(calls.filter(call => call.status !== "ended").map(call => hangupRealtimeCall(call.callId)));
}

export function recentAiContext(messages: SavedAiMessage[]) {
  const recent = messages.slice(-18);
  while (recent.length && recent.reduce((count, item) => count + item.content.length, 0) > 10_000) recent.splice(0, 2);
  return recent.map(({ role, content }) => ({ role, content }));
}

export async function prepareAiTurn(userId: string, input: AiChatInput) {
  if (!input.conversationId) return { input, previous: null, replay: null };
  const row = await getDb().query.aiConversations.findFirst({ where: eq(table.id, input.conversationId) });
  if (row && row.userId !== userId) throw missing();
  const previous = row ? view(row) : null;
  if (previous && row!.lastTurnId === input.turnId) {
    const last = previous.messages.at(-1)!;
    return { input, previous, replay: { reply: last.content, model: last.model ?? previous.model, conversation: previous } };
  }
  if ((previous?.revision ?? 0) !== input.revision) throw conflict();
  if (previous && previous.mode !== input.mode) throw new AiError("새 대화에서 모드를 변경해 주세요.", 400, "INVALID_MODE");
  if (previous && previous.messages.length >= 200) throw new AiError("대화가 길어졌어요. 새 대화를 시작해 주세요.", 400, "CONVERSATION_FULL");
  const messages = [...recentAiContext(previous?.messages ?? []), input.messages.at(-1)!];
  return { input: { ...input, messages }, previous, replay: null };
}

export async function saveAiTurn(userId: string, input: AiChatInput, previous: AiConversation | null, reply: AiChatReply) {
  if (!input.conversationId) return null;
  const now = Date.now();
  const messages: SavedAiMessage[] = [...(previous?.messages ?? []),
    { ...input.messages.at(-1)!, id: randomUUID() },
    { id: randomUUID(), role: "assistant", content: reply.reply, model: reply.model }];
  const values = { model: reply.model, messagesJson: JSON.stringify(messages), revision: (previous?.revision ?? 0) + 1, lastTurnId: input.turnId!, updatedAt: now };
  const rows = previous
    ? await getDb().update(table).set(values).where(and(eq(table.id, input.conversationId), eq(table.userId, userId), eq(table.revision, input.revision!))).returning()
    : await getDb().insert(table).values({ ...values, id: input.conversationId, userId, title: messages[0].content.slice(0, 60), mode: input.mode, createdAt: now }).onConflictDoNothing().returning();
  if (!rows[0]) throw conflict();
  return view(rows[0]);
}
