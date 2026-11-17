import { getActor } from "@/src/4-entity/account";
import { createAiProject, listAiProjects, readProjectInput } from "@/src/4-entity/ai/projects";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    return Response.json({ projects: await listAiProjects(actor.id) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    return Response.json({ project: await createAiProject(actor.id, await readProjectInput(request)) }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
