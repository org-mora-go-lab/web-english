import { randomUUID } from "node:crypto";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { getActor } from "@/src/4-entity/account";
import { lessons, songs } from "@/src/4-entity/lesson";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

const ids = new Set([...lessons, ...songs].map((lesson) => lesson.id));
const inputSchema = z.object({ saved: z.array(z.string()).max(100), completed: z.array(z.string()).max(100), history: z.array(z.string()).max(100) });

export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const rows = await getDb().query.lessonLibrary.findMany({ where: eq(schema.lessonLibrary.userId, actor.id) });
  return Response.json({ library: { saved: rows.filter((row) => row.saved).map((row) => row.lessonId), completed: rows.filter((row) => row.completed).map((row) => row.lessonId), history: rows.filter((row) => row.lastViewedAt).sort((a, b) => (b.lastViewedAt ?? 0) - (a.lastViewedAt ?? 0)).map((row) => row.lessonId) } });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || Object.values(parsed.data).some((values) => values.some((id) => !ids.has(id)))) return jsonError("학습 기록을 확인해 주세요.");
  const now = Date.now();
  const values = parsed.data;
  const present = new Set([...values.saved, ...values.completed, ...values.history]);
  await getDb().transaction(async (tx) => {
    await tx.delete(schema.lessonLibrary).where(eq(schema.lessonLibrary.userId, actor.id));
    for (const id of present) await tx.insert(schema.lessonLibrary).values({ id: randomUUID(), userId: actor.id, lessonId: id, saved: values.saved.includes(id), completed: values.completed.includes(id), lastViewedAt: values.history.includes(id) ? now - values.history.indexOf(id) : null, updatedAt: now });
  });
  return Response.json({ ok: true });
}
