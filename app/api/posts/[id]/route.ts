import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import { getActor } from "@/src/4-entity/account";
import { getPost, getPostDetails, mayEdit, mayRead, updatePost } from "@/src/4-entity/post/server";
import { getDb, schema } from "@/src/5-shared/db";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const post = await getPost((await context.params).id);
  if (!post || !mayRead(post, await getActor())) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  return Response.json({ post: await getPostDetails(post) });
}

export async function PATCH(request: Request, context: Context) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const post = await getPost((await context.params).id);
  if (!post) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  const actor = await getActor();
  if (!mayEdit(post, actor)) return jsonError("권한이 없습니다.", 403);
  try {
    const updated = await updatePost(post, await request.json(), actor!);
    return updated ? Response.json({ post: updated }) : jsonError("다른 기기에서 수정되었습니다. 새로고침 후 다시 시도해 주세요.", 409);
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof Error && (error.message.includes("본문") || error.message.includes("이미지"))) return jsonError("콘텐츠 입력값을 확인해 주세요.");
    throw error;
  }
}

export async function DELETE(request: Request, context: Context) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const post = await getPost((await context.params).id);
  if (!post) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  if (!mayEdit(post, await getActor())) return jsonError("권한이 없습니다.", 403);
  await getDb().delete(schema.posts).where(eq(schema.posts.id, post.id));
  return Response.json({ ok: true });
}
