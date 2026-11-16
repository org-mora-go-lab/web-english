import { getActor } from "@/src/4-entity/account";
import { prepareAiTurn, saveAiTurn } from "@/src/4-entity/ai/history";
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
    const turn = await prepareAiTurn(actor.id, input);
    if (turn.replay) return Response.json(turn.replay, { headers: { "Cache-Control": "no-store" } });
    requireAiConfiguration();
    await reserveAiRequest(actor.id);
    const reply = await generateAiReply(turn.input, request.signal);
    if (request.signal.aborted) throw new AiError("요청이 취소되었습니다.", 499, "REQUEST_CANCELLED");
    const conversation = await saveAiTurn(actor.id, input, turn.previous, reply);
    return Response.json({ ...reply, ...(conversation ? { conversation } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
