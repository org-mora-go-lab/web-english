import { and, desc, eq } from "drizzle-orm";

import { getActor } from "@/src/4-entity/account";
import { getPost, getPostDetails, mayEdit, updatePost } from "@/src/4-entity/post/server";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const post = await getPost((await context.params).id);
  const actor = await getActor();
  if (!post || !mayEdit(post, actor)) return jsonError("권한이 없습니다.", 403);
  const revisions = await getDb().query.postRevisions.findMany({ where: eq(schema.postRevisions.postId, post.id), orderBy: desc(schema.postRevisions.version), limit: 30 });
  return Response.json({ revisions: revisions.map((revision) => ({ ...revision, contentJson: JSON.parse(revision.contentJson) })) });
}

export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const post = await getPost((await context.params).id);
  const actor = await getActor();
  if (!post || !mayEdit(post, actor)) return jsonError("권한이 없습니다.", 403);
  const body = await request.json().catch(() => null);
  if (!Number.isInteger(body?.version)) return jsonError("버전을 선택해 주세요.");
  const revision = await getDb().query.postRevisions.findFirst({ where: and(eq(schema.postRevisions.postId, post.id), eq(schema.postRevisions.version, body.version)) });
  if (!revision) return jsonError("버전을 찾을 수 없습니다.", 404);
  const details = await getPostDetails(post);
  const updated = await updatePost(post, { title: post.title, summary: post.summary, contentJson: JSON.parse(revision.contentJson), level: post.level, visibility: post.visibility, category: details.category, tags: details.tags, coverImageUrl: post.coverImageUrl, version: post.version }, actor!);
  return updated ? Response.json({ post: updated }) : jsonError("다른 기기에서 수정되었습니다.", 409);
}
