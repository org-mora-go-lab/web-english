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
  const resources = useRef<{ controller: AbortController; pc: RTCPeerConnection | null; media: MediaStream | null; audio: HTMLAudioElement | null; sessionId: string; timer?: ReturnType<typeof setTimeout> } | null>(null);
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
    const current = { controller: new AbortController(), pc: null as RTCPeerConnection | null, media: null as MediaStream | null, audio: null as HTMLAudioElement | null, sessionId: "", timer: undefined as ReturnType<typeof setTimeout> | undefined };
    resources.current = current;
    setActive(true); setStatus("마이크 권한을 확인하고 있어요…");
    const valid = () => resources.current === current && generation.current === run;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!valid()) { media.getTracks().forEach(track => track.stop()); return; }
      current.media = media;
      media.getAudioTracks().forEach(track => { track.enabled = false; });
      setStatus("OpenAI 고급 음성에 연결하고 있어요…");
      const pc = new RTCPeerConnection(); current.pc = pc;
      const audio = document.createElement("audio"); audio.autoplay = true; current.audio = audio;
      pc.ontrack = event => {
        if (!valid()) return;
        audio.srcObject = event.streams[0];
        void audio.play().catch(() => { if (valid()) setAudioBlocked(true); });
      };
      pc.onconnectionstatechange = () => {
        if (valid() && ["failed", "disconnected", "closed"].includes(pc.connectionState)) { stop(); callbacks.current.onError("음성 연결이 끊겼어요. 저장된 대화에서 다시 시작해 주세요."); }
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
      const snapshot = callbacks.current;
      const response = await fetch("/api/ai/realtime", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: current.controller.signal,
        body: JSON.stringify({ sdp: pc.localDescription?.sdp ?? offer.sdp, conversationId: snapshot.conversationId || crypto.randomUUID(), revision: snapshot.revision, mode: snapshot.mode, voice: snapshot.voice }),
      });
      if (!response.ok) { const data = await response.json().catch(() => null); throw new Error(data?.error ?? "고급 음성 연결에 실패했어요."); }
      if (!response.body) throw new Error("음성 연결 데이터를 받지 못했어요.");
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      while (valid()) {
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
            current.timer = setTimeout(() => { if (valid()) { stop(); callbacks.current.onNotice("3분 음성 대화를 마쳤어요. 다시 시작해 이어갈 수 있어요."); } }, Math.max(1, event.expiresAt - Date.now()));
          } else if (event.kind === "ready") {
            media.getAudioTracks().forEach(track => { track.enabled = true; }); setStatus("듣고 있어요. 편하게 말씀해 주세요.");
          } else if (event.kind === "user") callbacks.current.onTranscript(event.text);
          else if (event.kind === "saved") callbacks.current.onConversation(event.conversation);
          else if (event.kind === "responding") setStatus("AI가 답변을 준비하고 있어요.");
          else if (event.kind === "speaking") setStatus("AI가 말하고 있어요. 말씀하시면 멈춰 들어요.");
          else if (event.kind === "listening") setStatus("듣고 있어요. 편하게 말씀해 주세요.");
          else if (event.kind === "ended") { stop(); callbacks.current.onNotice(event.message); return; }
        }
      }
      if (valid()) { stop(); callbacks.current.onNotice("음성 대화가 종료됐어요. 저장된 내역에서 이어갈 수 있어요."); }
    } catch (failure) {
      if (!valid()) return;
      stop();
      callbacks.current.onError(failure instanceof DOMException && ["NotAllowedError", "PermissionDeniedError"].includes(failure.name) ? "마이크 권한이 필요해요. 브라우저 사이트 설정에서 허용해 주세요." : failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "고급 음성에 연결하지 못했어요. 연결 상태를 확인해 주세요.");
    }
  }, [stop]);

  const toggleMute = useCallback(() => {
    const tracks = resources.current?.media?.getAudioTracks();
    if (!tracks?.length) return;
    const enabled = !tracks[0].enabled; tracks.forEach(track => { track.enabled = enabled; }); setMuted(!enabled);
  }, []);

  const resumeAudio = useCallback(() => {
    void resources.current?.audio?.play().then(() => setAudioBlocked(false)).catch(() => callbacks.current.onError("브라우저에서 소리 재생을 허용해 주세요."));
  }, []);

  return { available, active, muted, audioBlocked, status, start, stop, toggleMute, resumeAudio };
}
