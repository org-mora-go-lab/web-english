import { getActor } from "@/src/4-entity/account";
import { readVoiceAction } from "@/src/4-entity/ai/realtime";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";
import { prepareWarmCall, warmActionSchema } from "@/src/4-entity/ai/voice-warm";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";

export async function POST(request: Request, { params }: RouteContext<"/api/ai/realtime/[id]/warm">) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    const input = warmActionSchema.safeParse(await readVoiceAction(request));
    if (!input.success) throw new AiError("음성 연결 정보를 확인해 주세요.", 400, "INVALID_REQUEST");
    return Response.json(await prepareWarmCall(actor.id, (await params).id, input.data), { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return aiErrorResponse(error); }
}
