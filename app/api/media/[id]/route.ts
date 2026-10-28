import { del } from "@vercel/blob";
import { eq } from "drizzle-orm";

import { getActor } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const asset = await getDb().query.mediaAssets.findFirst({ where: eq(schema.mediaAssets.id, (await context.params).id) });
  if (!asset) return jsonError("이미지를 찾을 수 없습니다.", 404);
  if (asset.ownerId !== actor.id && actor.role !== "admin") return jsonError("권한이 없습니다.", 403);
  await del(asset.storageKey);
  await getDb().delete(schema.mediaAssets).where(eq(schema.mediaAssets.id, asset.id));
  return Response.json({ ok: true });
}
