import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq } from "drizzle-orm";
import { z } from "zod";

import { getDb, schema } from "@/src/5-shared/db";

import { getOwnedVoiceSession } from "./realtime";
import { AiError } from "./server";

export const warmActionSchema = z.strictObject({ action: z.enum(["context", "activate", "ready"]), revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER) });

export async function prepareWarmCall(userId: string, id: string, input: z.infer<typeof warmActionSchema>) {
  const table = schema.aiVoiceSessions;
  const session = await getOwnedVoiceSession(userId, id);
  if (!session.warmPending || !session.continuationOf || !["standby", "active"].includes(session.status) || session.expiresAt <= Date.now()) throw new AiError("대기 중인 음성 연결을 찾을 수 없습니다.", 409, "VOICE_WARM_INVALID");
  return await getDb().transaction(async tx => {
    const child = await tx.query.aiVoiceSessions.findFirst({ where: and(eq(table.id, id), eq(table.userId, userId)) });
    const parent = await tx.query.aiVoiceSessions.findFirst({ where: and(eq(table.id, session.continuationOf!), eq(table.userId, userId)) });
    const conversation = await tx.query.aiConversations.findFirst({ where: and(eq(schema.aiConversations.id, session.conversationId), eq(schema.aiConversations.userId, userId)) });
    if (!child?.warmPending || !parent || (!["active", "retiring"].includes(parent.status) && !(input.action === "ready" && parent.status === "ended" && child.status === "active")) || parent.conversationId !== child.conversationId || (conversation?.revision ?? 0) !== input.revision) throw new AiError("대화가 변경되어 다음 연결의 문맥을 다시 준비합니다.", 409, "VOICE_WARM_STALE");
    if (input.action === "context") {
      await tx.update(table).set({ revision: input.revision, warmRequestId: randomUUID(), warmReady: false }).where(eq(table.id, id));
    } else {
      if (!child.warmReady || child.revision !== input.revision) throw new AiError("다음 음성 연결을 준비하고 있어요.", 409, "VOICE_WARM_NOT_READY");
      if (input.action === "activate") {
        if (parent.status !== "active" || child.status !== "standby") throw new AiError("음성 연결이 이미 변경됐어요.", 409, "VOICE_WARM_INVALID");
        await tx.update(table).set({ status: "retiring" }).where(eq(table.id, parent.id));
        await tx.update(table).set({ status: "active" }).where(eq(table.id, id));
      } else {
        if (child.status !== "active" || !["retiring", "ended"].includes(parent.status)) throw new AiError("음성 연결 전환을 확인하지 못했어요.", 409, "VOICE_WARM_INVALID");
        await tx.update(table).set({ warmPending: false }).where(eq(table.id, id));
      }
    }
    return { ok: true };
  });
}
