import { randomUUID } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getActor } from "@/src/4-entity/account";
import { getPost, mayRead } from "@/src/4-entity/post/server";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET() {
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const progress = await getDb().query.learningProgress.findMany({ where: eq(schema.learningProgress.userId, actor.id) });
  return Response.json({ progress });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const parsed = z.object({ postId: z.string().uuid(), status: z.enum(["started", "completed"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("학습 기록을 확인해 주세요.");
  const post = await getPost(parsed.data.postId);
  if (!post || !mayRead(post, actor)) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  const now = Date.now();
  await getDb().insert(schema.learningProgress).values({ id: randomUUID(), userId: actor.id, postId: post.id, status: parsed.data.status, completedAt: parsed.data.status === "completed" ? now : null, updatedAt: now }).onConflictDoUpdate({ target: [schema.learningProgress.userId, schema.learningProgress.postId], set: { status: sql`CASE WHEN ${schema.learningProgress.status} = 'completed' THEN 'completed' ELSE excluded.status END`, completedAt: sql`COALESCE(${schema.learningProgress.completedAt}, excluded.completed_at)`, updatedAt: now } });
  const progress = await getDb().query.learningProgress.findFirst({ where: and(eq(schema.learningProgress.userId, actor.id), eq(schema.learningProgress.postId, post.id)) });
  return Response.json({ progress });
}
