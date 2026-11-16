import "server-only";

import { randomUUID } from "node:crypto";

import { and, eq, isNull, lt, or } from "drizzle-orm";
import WebSocket from "ws";

import { getDb, schema } from "@/src/5-shared/db";

import { getAiConversation, recentAiContext } from "./history";
import { getOwnedVoiceSession, hangupRealtimeCall } from "./realtime";
import { AiError } from "./server";
import type { RealtimeEvent, VoiceObserverState } from "./type";
import { VOICE_OBSERVER_DEADLINE_MS, VOICE_OBSERVER_REFRESH_MS, voiceInstructions } from "./voice-agent";
import { createVoiceObserver } from "./voice-observer";

const observedTypes = new Set([
  "input_audio_buffer.committed", "conversation.item.added", "conversation.item.created", "conversation.item.done",
  "conversation.item.input_audio_transcription.completed", "conversation.item.input_audio_transcription.failed",
  "response.created", "response.done", "error",
]);

// Observer requests overlap. They never replace or mute the primary WebRTC audio.
export async function watchRealtimeSession(userId: string, connection: { sessionId: string; sdp?: string; model?: string; voice?: string; expiresAt?: number }, signal: AbortSignal, sessionVersion: number, previousObserverId?: string) {
  const table = schema.aiVoiceSessions;
  const session = await getOwnedVoiceSession(userId, connection.sessionId);
  const observerId = randomUUID(); const startedAt = Date.now();
  if (session.expiresAt <= startedAt) throw new AiError("음성 연결이 종료됐어요.", 409, "VOICE_ENDED");
  const reserved = previousObserverId
    ? await getDb().update(table).set({ nextObserverId: observerId, nextObserverReady: false, nextObserverAt: startedAt }).where(and(eq(table.id, session.id), or(eq(table.status, "active"), eq(table.status, "retiring")), eq(table.observerId, previousObserverId), or(isNull(table.nextObserverId), lt(table.nextObserverAt, startedAt - 20_000)))).returning({ id: table.id })
    : await getDb().update(table).set({ status: session.status === "standby" ? "standby" : "active", observerId }).where(and(eq(table.id, session.id), or(eq(table.status, "created"), eq(table.status, "standby")), isNull(table.observerId))).returning({ id: table.id });
  if (!reserved.length) throw new AiError("음성 연결 갱신 상태가 변경됐어요.", 409, "VOICE_OBSERVER_CONFLICT");
  let stop = async () => {};
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const encoder = new TextEncoder(); let closed = false; let finishing = false; let owned = !previousObserverId; let activating = false; let polling = false;
      let lastAuth = 0; let chain = Promise.resolve();
      let recording = !session.warmPending; let contextRequest = ""; let contextUpdating = false; let contextRevision = session.revision; let observerFailure: unknown;
      let observer: Awaited<ReturnType<typeof createVoiceObserver>> | null = null;
      const pending: RealtimeEvent[] = [];
      const emit = (event: Record<string, unknown>) => { if (!closed) { try { controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); } catch { /* The browser disconnected. */ } } };
      const ws = new WebSocket(`wss://api.openai.com/v1/realtime?call_id=${encodeURIComponent(session.callId)}`, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY?.trim()}` }, handshakeTimeout: 10_000, maxPayload: 1024 * 1024 });
      const clean = () => {
        clearTimeout(deadline); clearTimeout(connectTimeout); clearTimeout(refreshTimer); clearInterval(heartbeat);
        signal.removeEventListener("abort", abort); ws.removeAllListeners("message");
        if (ws.readyState === WebSocket.OPEN) ws.close(); else ws.terminate();
      };
      const close = () => { closed = true; try { controller.close(); } catch { /* Already cancelled. */ } };
      const finish = async (message?: string) => {
        if (finishing || closed) return;
        finishing = true; clean(); await chain;
        const row = await getOwnedVoiceSession(userId, session.id).catch(() => null);
        if (row?.observerId === observerId || (!row && owned)) {
          if (message) emit({ kind: "ended", message });
          await Promise.allSettled([
            getDb().update(table).set({ status: "ended", renewable: false, observerStateJson: "", ...(row?.status === "standby" ? { continuationOf: null } : {}) }).where(and(eq(table.id, session.id), eq(table.observerId, observerId))),
            hangupRealtimeCall(session.callId),
          ]);
        } else if (row?.nextObserverId === observerId) {
          await getDb().update(table).set({ nextObserverId: null, nextObserverReady: false }).where(and(eq(table.id, session.id), eq(table.nextObserverId, observerId)));
          if (message) emit({ kind: "observer-error", message });
        }
        close();
      };
      stop = finish;
      const abort = () => { void finish(); };
      const deadline = setTimeout(() => { void finish("음성 저장 연결을 갱신하지 못했어요. 다시 연결해 주세요."); }, VOICE_OBSERVER_DEADLINE_MS);
      const refreshTimer = setTimeout(() => { if (owned) emit({ kind: "refresh", observerId }); }, VOICE_OBSERVER_REFRESH_MS);
      const connectTimeout = setTimeout(() => { void finish("음성 저장 연결이 지연되고 있어요."); }, 15_000);
      const createObserver = (revision: number, state?: VoiceObserverState) => createVoiceObserver({ userId, conversationId: session.conversationId, revision, mode: session.mode, emit, state });
      const transfer = async (nextId: string) => {
        if (finishing || !observer) return;
        finishing = true;
        // Stop intake only after the replacement socket is receiving the same call.
        ws.removeAllListeners("message"); await chain;
        if (observerFailure) { finishing = false; await finish("대화 내역을 저장하지 못했어요."); return; }
        const snapshot = observer.snapshot();
        const moved = await getDb().update(table).set({ observerId: nextId, nextObserverId: null, nextObserverReady: false, observerStateJson: JSON.stringify(snapshot), revision: snapshot.revision }).where(and(eq(table.id, session.id), or(eq(table.status, "active"), eq(table.status, "retiring")), eq(table.observerId, observerId), eq(table.nextObserverId, nextId), eq(table.nextObserverReady, true))).returning({ id: table.id });
        if (!moved.length) { finishing = false; await finish("음성 저장 연결 교체에 실패했어요."); return; }
        owned = false; emit({ kind: "detached", observerId }); clean(); close();
      };
      const activate = async (row: typeof session) => {
        if (activating || owned || finishing) return;
        activating = true;
        const state = row.observerStateJson ? JSON.parse(row.observerStateJson) as VoiceObserverState : undefined;
        observer = await createObserver(row.revision, state);
        await getDb().update(table).set({ observerStateJson: "" }).where(and(eq(table.id, session.id), eq(table.observerId, observerId)));
        owned = true;
        const buffered = pending.splice(0);
        chain = chain.then(async () => {
          for (const event of buffered) await observer!(event);
          emit({ kind: "ready", observerId });
        }).catch(error => { void finish(error instanceof AiError ? error.message : "대화를 저장하지 못했어요."); });
      };
      const heartbeat = setInterval(() => {
        if (polling || finishing || closed) return;
        polling = true;
        void (async () => {
          const row = await getOwnedVoiceSession(userId, session.id);
          if (row.status === "ended" || row.expiresAt <= Date.now()) { await finish("음성 연결이 종료됐어요."); return; }
          if (row.warmPending && row.createdAt + 180_000 <= Date.now()) { await finish("대기 중인 음성 연결을 준비하지 못했어요."); return; }
          if (Date.now() - lastAuth >= 5_000) {
            const user = await getDb().query.users.findFirst({ where: eq(schema.users.id, userId), columns: { status: true, sessionVersion: true } });
            if (!user || user.status !== "active" || user.sessionVersion !== sessionVersion) { await finish("로그인 상태가 변경되어 음성을 종료했어요."); return; }
            lastAuth = Date.now(); emit({ kind: "heartbeat" });
          }
          if (owned && row.warmPending && row.warmRequestId && row.warmRequestId !== contextRequest && !contextUpdating) {
            const conversation = row.revision ? await getAiConversation(userId, row.conversationId) : null;
            if ((conversation?.revision ?? 0) !== row.revision) { emit({ kind: "warm-stale" }); return; }
            contextRequest = row.warmRequestId; contextRevision = row.revision; contextUpdating = true;
            ws.send(JSON.stringify({ type: "session.update", session: { type: "realtime", instructions: voiceInstructions(row.mode, recentAiContext(conversation?.messages ?? []), row.voice) } }));
          }
          if (owned && !recording && !row.warmPending) {
            observer = await createObserver(row.revision); recording = true;
            const buffered = pending.splice(0);
            chain = chain.then(async () => { for (const event of buffered) await observer!(event); }).catch(error => { observerFailure = error; void finish("대화를 저장하지 못했어요."); });
          }
          if (owned && row.nextObserverReady && row.nextObserverId) await transfer(row.nextObserverId);
          else if (!owned && row.observerId === observerId) await activate(row);
        })().catch(() => { void finish("음성 저장 연결을 확인하지 못했어요."); }).finally(() => { polling = false; });
      }, 500);
      signal.addEventListener("abort", abort, { once: true });
      emit(connection.sdp ? { kind: "session", ...connection, observerId } : { kind: "observer", observerId });
      ws.on("open", () => {
        clearTimeout(connectTimeout);
        chain = chain.then(async () => {
          if (finishing) return;
          if (owned) { if (recording) observer = await createObserver(session.revision); emit({ kind: "ready", observerId }); }
          else {
            const ready = await getDb().update(table).set({ nextObserverReady: true }).where(and(eq(table.id, session.id), eq(table.nextObserverId, observerId), eq(table.observerId, previousObserverId!))).returning({ id: table.id });
            if (!ready.length) throw new Error("Observer reservation changed");
            emit({ kind: "attached", observerId });
          }
        }).catch(() => { void finish("음성 저장 연결에 실패했어요."); });
      });
      ws.on("message", raw => {
        if (finishing || closed) return;
        let event: RealtimeEvent;
        try { event = JSON.parse(raw.toString()); } catch { void finish("음성 데이터를 읽지 못했어요."); return; }
        if (!event || typeof event.type !== "string") { void finish("음성 데이터를 읽지 못했어요."); return; }
        if (event.type === "session.updated" && contextUpdating) {
          contextUpdating = false;
          void getDb().update(table).set({ warmReady: true }).where(and(eq(table.id, session.id), eq(table.warmRequestId, contextRequest))).returning({ id: table.id }).then(rows => { if (rows.length) emit({ kind: "warm-ready", revision: contextRevision }); }).catch(() => { void finish("다음 대화 문맥을 준비하지 못했어요."); });
        }
        if (!owned || !recording) {
          if (observedTypes.has(event.type)) pending.push(event);
          if (pending.length > 2048) void finish("음성 저장 대기열을 확인하지 못했어요.");
          return;
        }
        if (event.type === "input_audio_buffer.speech_started") emit({ kind: "listening" });
        if (event.type === "response.created") emit({ kind: "responding" });
        if (event.type === "output_audio_buffer.started") emit({ kind: "speaking" });
        if (["output_audio_buffer.stopped", "output_audio_buffer.cleared"].includes(event.type)) emit({ kind: "listening" });
        if (observedTypes.has(event.type)) chain = chain.then(async () => { if (observer) await observer(event); }).catch(error => { observerFailure = error; void finish(error instanceof AiError ? error.message : "대화를 저장하지 못했어요."); });
      });
      ws.on("error", () => { void finish("고급 음성 저장 연결에 실패했어요."); });
      ws.on("close", () => { void finish("음성 저장 연결이 종료됐어요."); });
      if (signal.aborted) void finish();
    },
    cancel() { void stop(); },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson", "Cache-Control": "no-store, no-transform", "X-Accel-Buffering": "no" } });
}
