import { eq, sql } from "drizzle-orm";
import { z } from "zod";

import { getActor } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET() {
  const actor = await getActor();
  if (actor?.role !== "admin") return jsonError("권한이 없습니다.", 403);
  const users = await getDb().select({ id: schema.users.id, email: schema.users.email, displayName: schema.users.displayName, role: schema.users.role, status: schema.users.status, createdAt: schema.users.createdAt }).from(schema.users).limit(200);
  return Response.json({ users });
}

export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (actor?.role !== "admin") return jsonError("권한이 없습니다.", 403);
  const parsed = z.object({ id: z.string().uuid(), status: z.enum(["active", "disabled"]) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.id === actor.id) return jsonError("회원 상태를 확인해 주세요.");
  await getDb().update(schema.users).set({ status: parsed.data.status, sessionVersion: sql`${schema.users.sessionVersion} + 1`, updatedAt: Date.now() }).where(eq(schema.users.id, parsed.data.id));
  return Response.json({ ok: true });
}
