import { getActor } from "@/src/4-entity/account";
import { deleteAiProject, readProjectInput, renameAiProject } from "@/src/4-entity/ai/projects";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";

type ProjectRoute = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: ProjectRoute) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    return Response.json({ project: await renameAiProject(actor.id, (await params).id, await readProjectInput(request)) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}

export async function DELETE(request: Request, { params }: ProjectRoute) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    await deleteAiProject(actor.id, (await params).id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
