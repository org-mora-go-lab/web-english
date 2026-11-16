import { getActor } from "@/src/4-entity/account";
import { endVoiceSession } from "@/src/4-entity/ai/realtime";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";

export async function DELETE(request: Request, { params }: RouteContext<"/api/ai/realtime/[id]">) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    await endVoiceSession(actor.id, (await params).id);
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
