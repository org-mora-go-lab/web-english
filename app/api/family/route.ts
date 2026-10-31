import { randomUUID } from "node:crypto";

import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { getActor } from "@/src/4-entity/account";
import { activityById } from "@/src/4-entity/family";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const db = getDb();
  const profile = await db.query.childProfiles.findFirst({ where: eq(schema.childProfiles.userId, actor.id) });
  const records = await db.query.playRecords.findMany({ where: eq(schema.playRecords.userId, actor.id), orderBy: [desc(schema.playRecords.playedAt)] });
  return Response.json({ ageMonths: profile?.ageMonths ?? 16, records });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처를 확인해 주세요.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const parsed = z.object({ ageMonths: z.number().int().min(16).max(36) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("월령은 16~36개월로 입력해 주세요.");
  const db = getDb();
  const now = Date.now();
  await db.insert(schema.childProfiles).values({ id: randomUUID(), userId: actor.id, ageMonths: parsed.data.ageMonths, createdAt: now, updatedAt: now }).onConflictDoUpdate({ target: schema.childProfiles.userId, set: { ageMonths: parsed.data.ageMonths, updatedAt: now } });
  return Response.json({ ageMonths: parsed.data.ageMonths });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처를 확인해 주세요.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const parsed = z.object({ activityId: z.string(), reaction: z.enum(["enjoyed", "noticed", "retry"]), note: z.string().trim().max(300) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || !activityById(parsed.data.activityId)) return jsonError("기록 내용을 확인해 주세요.");
  const db = getDb();
  const profile = await db.query.childProfiles.findFirst({ where: eq(schema.childProfiles.userId, actor.id) });
  const now = Date.now();
  const record = { id: randomUUID(), userId: actor.id, ageMonths: profile?.ageMonths ?? 16, activityId: parsed.data.activityId, reaction: parsed.data.reaction, note: parsed.data.note, playedAt: now, createdAt: now };
  await db.insert(schema.playRecords).values(record);
  return Response.json({ record }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처를 확인해 주세요.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("기록 ID가 필요합니다.");
  const deleted = await getDb().delete(schema.playRecords).where(and(eq(schema.playRecords.id, id), eq(schema.playRecords.userId, actor.id))).returning({ id: schema.playRecords.id });
  return deleted.length ? Response.json({ ok: true }) : jsonError("기록을 찾을 수 없습니다.", 404);
}
