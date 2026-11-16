"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AiVoiceCall, AiVoiceOptions, AiVoiceResources } from "../type";

function closeCall(call: AiVoiceCall) {
  clearTimeout(call.timer); clearTimeout(call.warmTimer);
  call.controllers.forEach(controller => controller.abort());
  if (call.pc) { call.pc.onconnectionstatechange = null; call.pc.ontrack = null; call.pc.close(); }
  if (call.audio) { call.audio.pause(); call.audio.srcObject = null; call.audio.remove(); }
  if (call.sessionId) void fetch(`/api/ai/realtime/${call.sessionId}`, { method: "DELETE", keepalive: true }).catch(() => {});
}

export function useAiVoice(options: AiVoiceOptions) {
  const [available, setAvailable] = useState(false);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [status, setStatus] = useState("고급 음성 꺼짐");
  const callbacks = useRef(options);
  const resources = useRef<AiVoiceResources | null>(null);
  const generation = useRef(0);
  useEffect(() => { callbacks.current = options; }, [options]);

  const stop = useCallback(() => {
    generation.current++;
    const current = resources.current; resources.current = null;
    if (current) {
      current.media?.getTracks().forEach(track => track.stop());
      if (current.primary) closeCall(current.primary);
      if (current.spare) closeCall(current.spare);
      if (current.retiring) closeCall(current.retiring);
    }
    setActive(false); setMuted(false); setAudioBlocked(false); setStatus("고급 음성 꺼짐");
  }, []);
  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => { if (!disposed) setAvailable(Boolean(window.isSecureContext && window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia)); });
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hidden); window.addEventListener("pagehide", stop);
    return () => { disposed = true; document.removeEventListener("visibilitychange", hidden); window.removeEventListener("pagehide", stop); stop(); };
  }, [stop]);

  const start = useCallback(async () => {
    stop(); const run = generation.current;
    const current: AiVoiceResources = { media: null, primary: null, spare: null, retiring: null, muted: false, advancing: false };
    resources.current = current;
    setActive(true); setStatus("마이크 권한을 확인하고 있어요…");
    const valid = () => resources.current === current && generation.current === run;
    const callValid = (call: AiVoiceCall) => valid() && (current.primary === call || current.spare === call || current.retiring === call);
    const snapshot = callbacks.current;
    const conversationId = snapshot.conversationId || crypto.randomUUID();
    let revision = snapshot.revision; let warmAttempts = 0;
    const fail = (failure: unknown) => {
      if (!valid()) return;
      stop();
      callbacks.current.onError(failure instanceof DOMException && ["NotAllowedError", "PermissionDeniedError"].includes(failure.name) ? "마이크 권한이 필요해요. 브라우저 사이트 설정에서 허용해 주세요." : failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "고급 음성에 연결하지 못했어요. 연결 상태를 확인해 주세요.");
    };
    const failCall = (call: AiVoiceCall, failure: unknown) => {
      if (!callValid(call)) return;
      if (current.spare === call && !call.activated) {
        current.spare = null; closeCall(call);
        if (current.primary && warmAttempts < 3) current.primary.warmTimer = setTimeout(() => { void prepareNext(); }, 45_000);
      } else fail(failure);
    };
    const idle = (call: AiVoiceCall) => !call.inputBusy && !call.responseBusy && !call.outputBusy && call.pending.size === 0;
    function scheduleNext(call: AiVoiceCall) {
      clearTimeout(call.warmTimer);
      // Prepare the provider's replacement five minutes before its session expires.
      call.warmTimer = setTimeout(() => { void prepareNext(); }, Math.max(1, call.expiresAt - Date.now() - 5 * 60_000));
    }
    async function warmAction(call: AiVoiceCall, action: "context" | "activate" | "ready", atRevision: number) {
      const controller = new AbortController(); call.controllers.add(controller);
      try {
        const response = await fetch(`/api/ai/realtime/${call.sessionId}/warm`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ action, revision: atRevision }) });
        if (!response.ok) { const data = await response.json().catch(() => null); const error = new Error(data?.error ?? "다음 음성 연결을 준비하지 못했어요."); if (response.status === 409) error.name = "StaleWarmContext"; throw error; }
      } finally { call.controllers.delete(controller); }
    }
    async function advanceWarm() {
      const old = current.primary; const next = current.spare;
      if (!valid() || current.advancing || !old || !next?.ready || next.pc?.connectionState !== "connected" || next.channel?.readyState !== "open" || !idle(old)) return;
      current.advancing = true;
      try {
        if (next.warmRevision !== revision) {
          if (next.contextRevision !== revision) { next.contextRevision = revision; await warmAction(next, "context", revision); }
          return;
        }
        if (!next.activated) { await warmAction(next, "activate", revision); next.activated = true; }
        if (!callValid(next) || !idle(old) || next.warmRevision !== revision) { next.contextRevision = -1; return; }
        // Both transports are connected. Move the sender only between completed turns.
        current.primary = next; current.spare = null; current.retiring = old;
        await next.sender!.replaceTrack(current.media!.getAudioTracks()[0]);
        await old.sender!.replaceTrack(null);
        if (!valid()) return;
        next.audio!.muted = false;
        void next.audio!.play().catch(() => { if (valid()) setAudioBlocked(true); });
        await warmAction(next, "ready", revision);
        closeCall(old); current.retiring = null; warmAttempts = 0; scheduleNext(next);
        setStatus("듣고 있어요. 편하게 말씀해 주세요.");
      } catch (failure) {
        if (failure instanceof Error && failure.name === "StaleWarmContext" && current.spare === next && callValid(next)) {
          next.contextRevision = -1; next.warmRevision = -1;
          setTimeout(() => { if (valid()) void advanceWarm(); }, 800);
        } else failCall(next, failure);
      } finally {
        current.advancing = false;
        if (valid() && current.spare?.warmRevision === revision && current.primary && idle(current.primary)) queueMicrotask(() => { void advanceWarm(); });
      }
    }
    async function prepareNext() {
      if (!valid() || current.spare || !current.primary?.ready) return;
      warmAttempts++;
      try { await createCall(current.primary.sessionId); } catch (failure) {
        const spare = current.spare;
        if (spare) failCall(spare, failure);
        else if (current.primary && warmAttempts < 3) current.primary.warmTimer = setTimeout(() => { void prepareNext(); }, 45_000);
      }
    }
    function rtcEvent(call: AiVoiceCall, event: { type: string; item_id?: string; item?: { id: string; role?: string }; response?: { id: string; status?: string } }) {
      if (!callValid(call)) return;
      if (event.type === "input_audio_buffer.speech_started") call.inputBusy = true;
      if (event.type === "input_audio_buffer.speech_stopped") call.inputBusy = false;
      const userId = event.type === "input_audio_buffer.committed" ? event.item_id : ["conversation.item.added", "conversation.item.created"].includes(event.type) && event.item?.role === "user" ? event.item.id : "";
      if (userId && !call.finishedUsers.has(userId)) { call.latestUser = userId; call.pending.add(userId); }
      if (event.type === "response.created") { call.responseBusy = true; if (event.response?.id) call.responseUsers.set(event.response.id, call.latestUser); }
      if (event.type === "response.done") {
        call.responseBusy = false;
        const user = event.response?.id ? call.responseUsers.get(event.response.id) : "";
        if (event.response?.id) call.responseUsers.delete(event.response.id);
        if (event.response?.status === "cancelled" && user) { call.pending.delete(user); call.finishedUsers.add(user); }
      }
      if (event.type === "output_audio_buffer.started") call.outputBusy = true;
      if (["output_audio_buffer.stopped", "output_audio_buffer.cleared"].includes(event.type)) call.outputBusy = false;
      if (call.finishedUsers.size > 512) call.finishedUsers.delete(call.finishedUsers.values().next().value!);
      void advanceWarm();
    }
    async function consume(call: AiVoiceCall, response: Response, controller: AbortController, onReady?: () => void) {
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "음성 저장 연결에 실패했어요."); }
      if (!response.body) throw new Error("음성 연결 데이터를 받지 못했어요.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = ""; let detached = false; let observerId = "";
      try {
        while (callValid(call)) {
          const part = await reader.read(); if (part.done) break;
          buffer += decoder.decode(part.value, { stream: true });
          if (buffer.length > 1_500_000) throw new Error("음성 데이터를 읽지 못했어요.");
          let end: number;
          while ((end = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); if (!line.trim()) continue;
            const event = JSON.parse(line); if (!callValid(call)) return;
            if (event.observerId) observerId = event.observerId;
            if (event.kind === "session") {
              call.sessionId = event.sessionId; call.expiresAt = event.expiresAt;
              await call.pc!.setRemoteDescription({ type: "answer", sdp: event.sdp });
              clearTimeout(call.timer);
              call.timer = setTimeout(() => failCall(call, new Error("OpenAI 음성 세션이 종료됐어요. 저장된 대화에서 이어갈 수 있어요.")), Math.max(1, event.expiresAt - Date.now() + 10_000));
            } else if (event.kind === "ready") {
              call.observerId = observerId; call.refreshing = false;
              if (!call.ready) {
                call.ready = true;
                if (current.primary === call) { current.media!.getAudioTracks().forEach(track => { track.enabled = !current.muted; }); setStatus("듣고 있어요. 편하게 말씀해 주세요."); scheduleNext(call); }
              }
              onReady?.(); void advanceWarm();
            } else if (event.kind === "refresh" && observerId === call.observerId) void refresh(call);
            else if (event.kind === "detached") detached = true;
            else if (event.kind === "observer-error") throw new Error(event.message);
            else if (event.kind === "warm-ready") { call.warmRevision = event.revision; void advanceWarm(); }
            else if (event.kind === "warm-stale") { call.contextRevision = -1; setTimeout(() => { void advanceWarm(); }, 800); }
            else if (event.kind === "user" && current.primary === call) callbacks.current.onTranscript(event.text);
            else if (event.kind === "saved" && current.primary === call) {
              revision = event.conversation.revision;
              if (event.userItemId) { call.pending.delete(event.userItemId); call.finishedUsers.add(event.userItemId); }
              callbacks.current.onConversation(event.conversation); void advanceWarm();
            }
            else if (event.kind === "responding" && current.primary === call) setStatus("AI가 답변을 준비하고 있어요.");
            else if (event.kind === "speaking" && current.primary === call) setStatus("AI가 말하고 있어요. 말씀하시면 멈춰 들어요.");
            else if (event.kind === "listening" && current.primary === call) setStatus("듣고 있어요. 편하게 말씀해 주세요.");
            else if (event.kind === "ended") { if (current.primary === call || call.activated) { stop(); callbacks.current.onNotice(event.message); } else failCall(call, new Error(event.message)); return; }
          }
        }
        if (callValid(call) && !detached) throw new Error("음성 저장 연결이 종료됐어요. 다시 연결해 주세요.");
      } finally { call.controllers.delete(controller); await reader.cancel().catch(() => {}); }
    }
    async function refresh(call: AiVoiceCall) {
      if (!callValid(call) || call.refreshing) return;
      call.refreshing = true;
      for (let attempt = 0; attempt < 3 && callValid(call); attempt++) {
        const controller = new AbortController(); call.controllers.add(controller); let attached = false;
        const timeout = setTimeout(() => controller.abort(), 15_000);
        try {
          const response = await fetch(`/api/ai/realtime/${call.sessionId}/observe`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ previousObserverId: call.observerId }), signal: controller.signal });
          await consume(call, response, controller, () => { attached = true; clearTimeout(timeout); }); return;
        } catch (failure) {
          if (!callValid(call)) return;
          if (attached || attempt === 2) { failCall(call, failure); return; }
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 1000));
        } finally { clearTimeout(timeout); call.controllers.delete(controller); }
      }
    }
    async function createCall(continuationOf?: string) {
      const call: AiVoiceCall = { controllers: new Set(), pc: null, media: null, audio: null, channel: null, sender: null, sessionId: "", observerId: "", ready: false, refreshing: false, expiresAt: 0, inputBusy: false, responseBusy: false, outputBusy: false, pending: new Set(), finishedUsers: new Set(), latestUser: "", responseUsers: new Map(), warmRevision: -1, contextRevision: -1, activated: false };
      if (continuationOf) current.spare = call; else current.primary = call;
      const pc = new RTCPeerConnection(); call.pc = pc;
      const audio = document.createElement("audio"); audio.autoplay = true; audio.muted = Boolean(continuationOf); call.audio = audio;
      pc.ontrack = event => { if (callValid(call)) { audio.srcObject = event.streams[0]; void audio.play().catch(() => { if (current.primary === call) setAudioBlocked(true); }); } };
      pc.onconnectionstatechange = () => {
        if (!callValid(call)) return;
        if (["failed", "disconnected", "closed"].includes(pc.connectionState)) failCall(call, new Error("음성 연결이 끊겼어요. 저장된 대화에서 다시 시작해 주세요."));
        else void advanceWarm();
      };
      call.sender = continuationOf ? pc.addTransceiver("audio", { direction: "sendrecv" }).sender : pc.addTrack(current.media!.getAudioTracks()[0], current.media!);
      const channel = pc.createDataChannel("oai-events"); call.channel = channel;
      channel.onopen = () => { void advanceWarm(); };
      channel.onmessage = message => { try { rtcEvent(call, JSON.parse(message.data)); } catch { /* Control state comes from the authenticated observer. */ } };
      const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
      if (pc.iceGatheringState !== "complete") await new Promise<void>(resolve => {
        const done = () => { clearTimeout(timer); pc.removeEventListener("icegatheringstatechange", change); resolve(); };
        const change = () => { if (pc.iceGatheringState === "complete") done(); };
        const timer = setTimeout(done, 2500); pc.addEventListener("icegatheringstatechange", change);
      });
      if (!callValid(call)) return;
      if (!continuationOf) setStatus("OpenAI 고급 음성에 연결하고 있어요…");
      call.timer = setTimeout(() => failCall(call, new Error("음성 연결이 지연되고 있어요. 다시 시도해 주세요.")), 45_000);
      const controller = new AbortController(); call.controllers.add(controller);
      const response = await fetch("/api/ai/realtime", { method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal, body: JSON.stringify({ sdp: pc.localDescription?.sdp ?? offer.sdp, conversationId, revision, mode: snapshot.mode, voice: snapshot.voice, ...(continuationOf ? { continuationOf } : {}) }) });
      void consume(call, response, controller).catch(failure => failCall(call, failure));
    }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!valid()) { media.getTracks().forEach(track => track.stop()); return; }
      current.media = media; media.getAudioTracks().forEach(track => { track.enabled = false; });
      await createCall();
    } catch (failure) { fail(failure); }
  }, [stop]);
  const toggleMute = useCallback(() => {
    const current = resources.current; if (!current) return;
    const tracks = current.media?.getAudioTracks(); if (!tracks?.length) return;
    current.muted = !current.muted;
    tracks.forEach(track => { track.enabled = Boolean(current.primary?.ready) && !current.muted; }); setMuted(current.muted);
  }, []);
  const resumeAudio = useCallback(() => { void resources.current?.primary?.audio?.play().then(() => setAudioBlocked(false)).catch(() => callbacks.current.onError("브라우저에서 소리 재생을 허용해 주세요.")); }, []);
  return { available, active, muted, audioBlocked, status, start, stop, toggleMute, resumeAudio };
}
