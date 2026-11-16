import "server-only";

import { and, eq } from "drizzle-orm";
import WebSocket from "ws";

import { getDb, schema } from "@/src/5-shared/db";

import { getOwnedVoiceSession, hangupRealtimeCall } from "./realtime";
import { AiError } from "./server";
import type { RealtimeEvent } from "./type";
import { createVoiceObserver } from "./voice-observer";

export async function watchRealtimeSession(userId: string, connection: { sessionId: string; sdp: string; model: string; voice: string; expiresAt: number }, signal: AbortSignal, sessionVersion: number) {
  const table = schema.aiVoiceSessions;
  const session = await getOwnedVoiceSession(userId, connection.sessionId);
  const activated = await getDb().update(table).set({ status: "active" }).where(and(eq(table.id, session.id), eq(table.status, "created"))).returning({ id: table.id });
  if (!activated.length) throw new AiError("음성 연결이 이미 종료됐어요.", 409, "VOICE_ENDED");
  let stop = async () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder(); let closed = false;
      const emit = (event: Record<string, unknown>) => { if (!closed) { try { controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); } catch { /* The browser disconnected. */ } } };
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(session.callId)}`, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim()}` }, handshakeTimeout: 10_000, maxPayload: 1024 * 1024 });
      let chain = Promise.resolve();
      const finish = async (message?: string) => {
        if (closed) return;
        if (message) emit({ kind: "ended", message });
        closed = true; clearTimeout(deadline); clearTimeout(connectTimeout); clearInterval(heartbeat);
        signal.removeEventListener("abort", abort);
        ws.removeAllListeners("message");
        if (ws.readyState === WebSocket.OPEN) ws.close(); else ws.terminate();
        await Promise.allSettled([
          getDb().update(table).set({ status: "ended" }).where(eq(table.id, session.id)),
          hangupRealtimeCall(session.callId),
        ]);
        try { controller.close(); } catch { /* Already cancelled. */ }
      };
      stop = finish;
      const abort = () => { void finish(); };
      const deadline = setTimeout(() => { void finish("3분 음성 대화를 마쳤어요. 저장된 대화에서 다시 시작해 주세요."); }, Math.max(1, session.expiresAt - Date.now()));
      const connectTimeout = setTimeout(() => { void finish("음성 연결이 지연되고 있어요. 다시 시작해 주세요."); }, 15_000);
      const heartbeat = setInterval(() => {
        void Promise.all([getOwnedVoiceSession(userId, session.id), getDb().query.users.findFirst({ where: eq(schema.users.id, userId), columns: { status: true, sessionVersion: true } })]).then(([row, user]) => {
          if (row.status === "ended" || !user || user.status !== "active" || user.sessionVersion !== sessionVersion) void finish("음성 연결이 종료됐어요.");
          else emit({ kind: "heartbeat" });
        }).catch(() => { void finish("음성 연결을 확인하지 못했어요. 다시 시작해 주세요."); });
      }, 5_000);
      signal.addEventListener("abort", abort, { once: true });
      emit({ kind: "session", ...connection });
      const observer = createVoiceObserver({ userId, conversationId: session.conversationId, revision: session.revision, mode: session.mode, emit,
        onSaved: saved => { void getDb().update(table).set({ revision: saved.revision }).where(eq(table.id, session.id)).catch(() => {}); },
      }).catch(() => { void finish("대화 내역을 확인하지 못했어요. 다시 불러와 주세요."); return async () => {}; });
      ws.on("open", () => { clearTimeout(connectTimeout); emit({ kind: "ready" }); });
      ws.on("message", raw => {
        if (closed) return;
        let event: RealtimeEvent;
        try { event = JSON.parse(raw.toString()); } catch { void finish("음성 데이터를 읽지 못했어요."); return; }
        if (!event || typeof event.type !== "string") { void finish("음성 데이터를 읽지 못했어요."); return; }
        if (event.type === "input_audio_buffer.speech_started") emit({ kind: "listening" });
        if (event.type === "response.created") emit({ kind: "responding" });
        if (event.type === "output_audio_buffer.started") emit({ kind: "speaking" });
        if (event.type === "output_audio_buffer.stopped") emit({ kind: "listening" });
        chain = chain.then(async () => { if (!closed) await (await observer)(event); }).catch(error => { void finish(error instanceof AiError ? error.message : "대화를 저장하지 못했어요. 내역을 다시 불러와 주세요."); });
      });
      ws.on("error", () => { void finish("고급 음성 연결에 실패했어요. API 키의 Realtime 권한과 연결 상태를 확인해 주세요."); });
      ws.on("close", () => { void finish("음성 연결이 종료됐어요. 저장된 대화에서 다시 시작할 수 있어요."); });
      if (signal.aborted) void finish();
    },
    cancel() { void stop(); },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" } });
}
