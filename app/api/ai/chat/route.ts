import { getActor } from "@/src/4-entity/account";
import { AiError, aiErrorResponse, generateAiReply, readAiChatInput, requireAiConfiguration, reserveAiRequest } from "@/src/4-entity/ai/server";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인 후 AI를 이용해 주세요.", 401, "AUTH_REQUIRED");
    const input = await readAiChatInput(request);
    requireAiConfiguration();
    await reserveAiRequest(actor.id);
    const reply = await generateAiReply(input, request.signal);
    return Response.json(reply, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
