import { get } from "@vercel/blob";
import { and, eq, like } from "drizzle-orm";

import { getActor } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const asset = await getDb().query.mediaAssets.findFirst({ where: eq(schema.mediaAssets.id, (await context.params).id) });
  if (!asset) return jsonError("이미지를 찾을 수 없습니다.", 404);
  const actor = await getActor();
  if (actor?.id !== asset.ownerId && actor?.role !== "admin") {
    const published = await getDb().query.posts.findFirst({ where: and(eq(schema.posts.status, "published"), eq(schema.posts.visibility, "public"), like(schema.posts.contentJson, `%${asset.url}%`)) });
    const cover = await getDb().query.posts.findFirst({ where: and(eq(schema.posts.status, "published"), eq(schema.posts.visibility, "public"), eq(schema.posts.coverImageUrl, asset.url)) });
    if (!published && !cover) return jsonError("권한이 없습니다.", 403);
  }
  const result = await get(asset.storageKey, { access: "private" });
  if (!result || result.statusCode !== 200) return jsonError("이미지를 찾을 수 없습니다.", 404);
  return new Response(result.stream, { headers: { "Content-Type": asset.mimeType, "X-Content-Type-Options": "nosniff", "Cache-Control": "private, no-cache" } });
}
