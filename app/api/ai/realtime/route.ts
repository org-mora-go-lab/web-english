import { getActor } from "@/src/4-entity/account";
import { endVoiceSession, readVoiceStart, startRealtime } from "@/src/4-entity/ai/realtime";
import { AiError, aiErrorResponse } from "@/src/4-entity/ai/server";
import { watchRealtimeSession } from "@/src/4-entity/ai/voice-stream";
import { sameOrigin } from "@/src/5-shared/http";

export const runtime = "nodejs";
export const maxDuration = 240;

export async function POST(request: Request) {
  try {
    if (!sameOrigin(request)) throw new AiError("허용되지 않은 요청입니다.", 403, "INVALID_ORIGIN");
    const actor = await getActor();
    if (!actor) throw new AiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
    const input = await readVoiceStart(request);
    const connection = await startRealtime(actor.id, input, request.signal);
    try { return await watchRealtimeSession(actor.id, connection, request.signal, actor.sessionVersion); }
    catch (error) { await endVoiceSession(actor.id, connection.sessionId).catch(() => {}); throw error; }
  } catch (error) { return aiErrorResponse(error); }
}
