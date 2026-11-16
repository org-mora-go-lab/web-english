"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AiVoiceOptions } from "../type";

export function useAiVoice(options: AiVoiceOptions) {
  const [available, setAvailable] = useState(false);
  const [active, setActive] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [status, setStatus] = useState("고급 음성 꺼짐");
  const callbacks = useRef(options);
  const resources = useRef<{ controller: AbortController; pc: RTCPeerConnection | null; media: MediaStream | null; audio: HTMLAudioElement | null; sessionId: string; muted: boolean; ready: boolean; timer?: ReturnType<typeof setTimeout> } | null>(null);
  const generation = useRef(0);
  useEffect(() => { callbacks.current = options; }, [options]);

  const stop = useCallback(() => {
    generation.current++;
    const current = resources.current; resources.current = null;
    if (current) {
      clearTimeout(current.timer); current.controller.abort();
      current.media?.getTracks().forEach(track => track.stop());
      if (current.pc) { current.pc.onconnectionstatechange = null; current.pc.ontrack = null; current.pc.close(); }
      if (current.audio) { current.audio.pause(); current.audio.srcObject = null; current.audio.remove(); }
      if (current.sessionId) void fetch(`/api/ai/realtime/${current.sessionId}`, { method: "DELETE", keepalive: true }).catch(() => {});
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
    stop();
    const run = generation.current;
    const current = { controller: new AbortController(), pc: null as RTCPeerConnection | null, media: null as MediaStream | null, audio: null as HTMLAudioElement | null, sessionId: "", muted: false, ready: false, timer: undefined as ReturnType<typeof setTimeout> | undefined };
    resources.current = current;
    setActive(true); setStatus("마이크 권한을 확인하고 있어요…");
    const valid = () => resources.current === current && generation.current === run;
    try {
      const snapshot = callbacks.current;
      const conversationId = snapshot.conversationId || crypto.randomUUID();
      let revision = snapshot.revision;
      let continuationOf: string | undefined;
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!valid()) { media.getTracks().forEach(track => track.stop()); return; }
      current.media = media;
      media.getAudioTracks().forEach(track => { track.enabled = false; });
      const audio = document.createElement("audio"); audio.autoplay = true; current.audio = audio;
      while (valid()) {
        current.ready = false;
        setStatus(continuationOf ? "대화 맥락을 유지하며 음성 연결을 갱신하고 있어요…" : "OpenAI 고급 음성에 연결하고 있어요…");
        const pc = new RTCPeerConnection(); current.pc = pc;
        pc.ontrack = event => {
          if (!valid()) return;
          audio.srcObject = event.streams[0];
          void audio.play().catch(() => { if (valid()) setAudioBlocked(true); });
        };
        pc.onconnectionstatechange = () => {
          if (valid() && current.pc === pc && ["failed", "disconnected", "closed"].includes(pc.connectionState)) { stop(); callbacks.current.onError("음성 연결이 끊겼어요. 저장된 대화에서 다시 시작해 주세요."); }
        };
        media.getTracks().forEach(track => pc.addTrack(track, media));
        pc.createDataChannel("oai-events");
        const offer = await pc.createOffer(); await pc.setLocalDescription(offer);
        if (pc.iceGatheringState !== "complete") await new Promise<void>(resolve => {
          const done = () => { clearTimeout(timer); pc.removeEventListener("icegatheringstatechange", change); resolve(); };
          const change = () => { if (pc.iceGatheringState === "complete") done(); };
          const timer = setTimeout(done, 2500); pc.addEventListener("icegatheringstatechange", change);
        });
        if (!valid()) return;
        current.timer = setTimeout(() => { if (valid()) { stop(); callbacks.current.onError("음성 연결이 지연되고 있어요. 다시 시도해 주세요."); } }, 45_000);
        const response = await fetch("/api/ai/realtime", {
          method: "POST", headers: { "Content-Type": "application/json" }, signal: current.controller.signal,
          body: JSON.stringify({ sdp: pc.localDescription?.sdp ?? offer.sdp, conversationId, revision, mode: snapshot.mode, voice: snapshot.voice, ...(continuationOf ? { continuationOf } : {}) }),
        });
        if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "고급 음성 연결에 실패했어요."); }
        if (!response.body) throw new Error("음성 연결 데이터를 받지 못했어요.");
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
        let renewal = ""; let renewing = false;
        stream: while (valid()) {
          const part = await reader.read(); if (part.done) break;
          buffer += decoder.decode(part.value, { stream: true });
          if (buffer.length > 1_500_000) throw new Error("음성 데이터를 읽지 못했어요.");
          let end: number;
          while ((end = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, end); buffer = buffer.slice(end + 1); if (!line.trim()) continue;
            const event = JSON.parse(line);
            if (!valid()) return;
            if (event.kind === "session") {
              current.sessionId = event.sessionId;
              await pc.setRemoteDescription({ type: "answer", sdp: event.sdp });
              clearTimeout(current.timer);
              current.timer = setTimeout(() => { if (valid()) { stop(); callbacks.current.onError("음성 연결 갱신 응답이 지연되고 있어요. 다시 연결해 주세요."); } }, Math.max(1, event.expiresAt - Date.now() + 10_000));
            } else if (event.kind === "ready") {
              current.ready = true;
              media.getAudioTracks().forEach(track => { track.enabled = !current.muted; }); setStatus("듣고 있어요. 편하게 말씀해 주세요.");
            } else if (event.kind === "user") callbacks.current.onTranscript(event.text);
            else if (event.kind === "saved") { revision = event.conversation.revision; callbacks.current.onConversation(event.conversation); }
            else if (event.kind === "renewing") {
              renewing = true; current.ready = false;
              media.getAudioTracks().forEach(track => { track.enabled = false; });
              setStatus("대화를 저장하고 음성 연결을 갱신하고 있어요. 잠시만 기다려 주세요…");
            }
            else if (event.kind === "renew") { renewal = event.sessionId; break stream; }
            else if (event.kind === "responding" && !renewing) setStatus("AI가 답변을 준비하고 있어요.");
            else if (event.kind === "speaking" && !renewing) setStatus("AI가 말하고 있어요. 말씀하시면 멈춰 들어요.");
            else if (event.kind === "listening" && !renewing) setStatus("듣고 있어요. 편하게 말씀해 주세요.");
            else if (event.kind === "ended") { stop(); callbacks.current.onNotice(event.message); return; }
          }
        }
        if (!valid()) return;
        if (!renewal || renewal !== current.sessionId) throw new Error("음성 연결이 종료됐어요. 저장된 내역에서 다시 연결해 주세요.");
        await reader.cancel();
        clearTimeout(current.timer);
        pc.onconnectionstatechange = null; pc.ontrack = null; pc.close(); current.pc = null;
        audio.pause(); audio.srcObject = null;
        media.getAudioTracks().forEach(track => { track.enabled = false; });
        current.sessionId = ""; continuationOf = renewal;
        // Reuse the microphone and the user's mute preference; never request permission again.
      }
    } catch (failure) {
      if (!valid()) return;
      stop();
      callbacks.current.onError(failure instanceof DOMException && ["NotAllowedError", "PermissionDeniedError"].includes(failure.name) ? "마이크 권한이 필요해요. 브라우저 사이트 설정에서 허용해 주세요." : failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "고급 음성에 연결하지 못했어요. 연결 상태를 확인해 주세요.");
    }
  }, [stop]);

  const toggleMute = useCallback(() => {
    const current = resources.current;
    if (!current) return;
    const tracks = current.media?.getAudioTracks();
    if (!tracks?.length) return;
    current.muted = !current.muted;
    tracks.forEach(track => { track.enabled = current.ready && !current.muted; }); setMuted(current.muted);
  }, []);

  const resumeAudio = useCallback(() => {
    void resources.current?.audio?.play().then(() => setAudioBlocked(false)).catch(() => callbacks.current.onError("브라우저에서 소리 재생을 허용해 주세요."));
  }, []);

  return { available, active, muted, audioBlocked, status, start, stop, toggleMute, resumeAudio };
}
