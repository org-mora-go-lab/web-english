import { getActor } from "@/src/4-entity/account";
import { getPost, mayEdit, publishPost } from "@/src/4-entity/post/server";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: Context) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const post = await getPost((await context.params).id);
  if (!post) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  if (!mayEdit(post, await getActor())) return jsonError("권한이 없습니다.", 403);
  const body = await request.json().catch(() => ({}));
  if (body.publish !== false && !post.contentText.trim()) return jsonError("본문을 작성한 뒤 발행해 주세요.");
  return Response.json({ post: await publishPost(post, body.publish !== false) });
}
