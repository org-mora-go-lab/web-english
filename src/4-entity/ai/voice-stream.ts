import "server-only";

import { and, eq } from "drizzle-orm";
import WebSocket from "ws";

import { getDb, schema } from "@/src/5-shared/db";

import { getOwnedVoiceSession, hangupRealtimeCall } from "./realtime";
import { AiError } from "./server";
import type { RealtimeEvent } from "./type";
import { VOICE_RENEW_AFTER_MS } from "./voice-agent";
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
      let renewalDue = false; let draining = false; let inputBusy = false; let playing = false;
      let idleTimer: ReturnType<typeof setTimeout> | undefined;
      const transcribing = new Set<string>(); const responding = new Set<string>();
      const idle = () => !inputBusy && !playing && !transcribing.size && !responding.size;
      const finish = async (message?: string, renew = false) => {
        if (closed) return;
        if (message) emit({ kind: "ended", message });
        closed = true; clearTimeout(deadline); clearTimeout(connectTimeout); clearTimeout(renewalTimer); clearTimeout(idleTimer); clearInterval(heartbeat);
        signal.removeEventListener("abort", abort);
        ws.removeAllListeners("message");
        if (ws.readyState === WebSocket.OPEN) ws.close(); else ws.terminate();
        await chain;
        const results = await Promise.allSettled([
          getDb().update(table).set({ status: "ended", renewable: renew }).where(eq(table.id, session.id)),
          hangupRealtimeCall(session.callId),
        ]);
        const canRenew = results.every(result => result.status === "fulfilled");
        if (renew && (!canRenew || signal.aborted)) await getDb().update(table).set({ renewable: false }).where(eq(table.id, session.id)).catch(() => {});
        // Emit only after persistence and hangup: the next call must not race the active-user lock.
        if (renew && !signal.aborted) {
          try { controller.enqueue(encoder.encode(`${JSON.stringify(canRenew ? { kind: "renew", sessionId: session.id } : { kind: "ended", message: "음성 연결 갱신에 실패했어요. 다시 시작해 주세요." })}\n`)); } catch { /* Already cancelled. */ }
        }
        try { controller.close(); } catch { /* Already cancelled. */ }
      };
      const checkRenewal = () => {
        clearTimeout(idleTimer);
        if (!closed && renewalDue && idle()) idleTimer = setTimeout(() => {
          if (closed || !idle()) return;
          if (!draining) {
            draining = true; emit({ kind: "renewing" });
            // Mute input, then drain in-flight events before switching calls.
            checkRenewal();
          } else void finish(undefined, true);
        }, 750);
      };
      stop = finish;
      const abort = () => { void finish(); };
      const deadline = setTimeout(() => { void finish("음성 연결 갱신이 지연되고 있어요. 저장된 대화에서 다시 연결해 주세요."); }, Math.max(1, session.expiresAt - Date.now()));
      const renewalTimer = setTimeout(() => { renewalDue = true; checkRenewal(); }, Math.max(1, session.createdAt + VOICE_RENEW_AFTER_MS - Date.now()));
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
        clearTimeout(idleTimer);
        chain = chain.then(async () => {
          if (closed) return;
          if (event.type === "input_audio_buffer.speech_started") { inputBusy = true; emit({ kind: "listening" }); }
          if (event.type === "input_audio_buffer.speech_stopped") inputBusy = false;
          if (event.type === "input_audio_buffer.committed" && event.item_id) transcribing.add(event.item_id);
          if (event.type === "conversation.item.input_audio_transcription.completed" && event.item_id) transcribing.delete(event.item_id);
          if (event.type === "response.created" && event.response?.id) { responding.add(event.response.id); emit({ kind: "responding" }); }
          if (event.type === "response.done" && event.response?.id) responding.delete(event.response.id);
          if (event.type === "output_audio_buffer.started") { playing = true; emit({ kind: "speaking" }); }
          if (["output_audio_buffer.stopped", "output_audio_buffer.cleared"].includes(event.type)) { playing = false; emit({ kind: "listening" }); }
          await (await observer)(event);
          checkRenewal();
        }).catch(error => { void finish(error instanceof AiError ? error.message : "대화를 저장하지 못했어요. 내역을 다시 불러와 주세요."); });
      });
      ws.on("error", () => { void finish("고급 음성 연결에 실패했어요. API 키의 Realtime 권한과 연결 상태를 확인해 주세요."); });
      ws.on("close", () => { void finish("음성 연결이 종료됐어요. 저장된 대화에서 다시 시작할 수 있어요."); });
      if (signal.aborted) void finish();
    },
    cancel() { void stop(); },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" } });
}
