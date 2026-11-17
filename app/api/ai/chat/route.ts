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
    if (request.headers.get("accept")?.includes("text/event-stream")) {
      const connection = new AbortController();
      const signal = AbortSignal.any([request.signal, connection.signal]);
      const encoder = new TextEncoder();
      const body = new ReadableStream<Uint8Array>({
        async start(controller) {
          const emit = (event: unknown) => { if (!signal.aborted) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`)); };
          try {
            const reply = await generateAiReply(turn.input, signal, text => emit({ type: "delta", text }));
            if (signal.aborted) return;
            const conversation = await saveAiTurn(actor.id, input, turn.previous, reply);
            emit({ type: "complete", ...reply, ...(conversation ? { conversation } : {}) });
          } catch (error) {
            const response = aiErrorResponse(error);
            emit({ type: "error", status: response.status, ...await response.json() });
          } finally {
            if (!connection.signal.aborted) controller.close();
          }
        },
        cancel() { connection.abort(); },
      });
      return new Response(body, { headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" } });
    }
    const reply = await generateAiReply(turn.input, request.signal);
    if (request.signal.aborted) throw new AiError("요청이 취소되었습니다.", 499, "REQUEST_CANCELLED");
    const conversation = await saveAiTurn(actor.id, input, turn.previous, reply);
    return Response.json({ ...reply, ...(conversation ? { conversation } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return aiErrorResponse(error);
  }
}
