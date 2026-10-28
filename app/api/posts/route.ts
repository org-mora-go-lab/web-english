import { ZodError } from "zod";

import { getActor } from "@/src/4-entity/account";
import { createPost, listPosts } from "@/src/4-entity/post/server";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function GET(request: Request) {
  const actor = await getActor();
  const url = new URL(request.url);
  const scope = url.searchParams.get("scope");
  if (scope === "mine" && !actor) return jsonError("로그인이 필요합니다.", 401);
  if (scope === "all" && actor?.role !== "admin") return jsonError("권한이 없습니다.", 403);
  return Response.json({ posts: await listPosts(scope === "mine" || scope === "all" ? scope : "public", actor, url.searchParams.get("q") ?? "") });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  try {
    const post = await createPost(actor, await request.json());
    return Response.json({ post }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError || error instanceof SyntaxError || error instanceof Error && error.message.includes("본문")) return jsonError("콘텐츠 입력값을 확인해 주세요.");
    throw error;
  }
}
