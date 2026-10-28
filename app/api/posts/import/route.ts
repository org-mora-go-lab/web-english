import { getActor } from "@/src/4-entity/account";
import { markdownToDocument } from "@/src/4-entity/post";
import { createPost } from "@/src/4-entity/post/server";
import { jsonError, sameOrigin } from "@/src/5-shared/http";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return jsonError("요청 출처가 올바르지 않습니다.", 403);
  const actor = await getActor();
  if (!actor) return jsonError("로그인이 필요합니다.", 401);
  const body = await request.json().catch(() => null);
  if (!body || typeof body.text !== "string" || body.text.length > 200_000 || !["json", "markdown"].includes(body.format)) return jsonError("가져올 파일 형식을 확인해 주세요.");
  try {
    const source = body.source === "paul" ? "paul" : "import";
    const input = body.format === "markdown" ? markdownToDocument(body.text) : JSON.parse(body.text);
    const draft = {
      title: input.title ?? "가져온 콘텐츠", summary: input.summary ?? "",
      contentJson: input.contentJson ?? input.content ?? input,
      category: input.category ?? "", tags: input.tags ?? [], level: input.level ?? "beginner", visibility: "private",
    };
    const post = await createPost(actor, draft, source);
    return Response.json({ post }, { status: 201 });
  } catch { return jsonError("콘텐츠를 변환하지 못했습니다. JSON 또는 Markdown 형식을 확인해 주세요."); }
}
