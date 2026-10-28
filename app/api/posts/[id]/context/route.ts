import { getActor } from "@/src/4-entity/account";
import { getPost, mayRead } from "@/src/4-entity/post/server";
import { jsonError } from "@/src/5-shared/http";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: Context) {
  const post = await getPost((await context.params).id);
  if (!post || !mayRead(post, await getActor())) return jsonError("콘텐츠를 찾을 수 없습니다.", 404);
  return Response.json({ title: post.title, summary: post.summary, content: post.contentText, level: post.level, url: `/posts/${post.slug}/context` });
}
