"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { AiVoiceOptions, Recognition, VoiceWindow } from "../type";

export function useAiVoice(options: AiVoiceOptions) {
  const [available, setAvailable] = useState(false);
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState("음성 대화 꺼짐");
  const callbacks = useRef(options);
  const running = useRef(false);
  const recognition = useRef<Recognition | null>(null);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { callbacks.current = options; }, [options]);

  const stop = useCallback(() => {
    running.current = false;
    if (timer.current) clearTimeout(timer.current);
    if (recognition.current) {
      recognition.current.onresult = null; recognition.current.onerror = null; recognition.current.onend = null;
      recognition.current.abort(); recognition.current = null;
    }
    if (utterance.current) { utterance.current.onend = null; utterance.current.onerror = null; utterance.current = null; }
    window.speechSynthesis?.cancel();
    setActive(false); setStatus("음성 대화 꺼짐");
  }, []);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => {
      if (!disposed) setAvailable(Boolean(((window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition) && window.speechSynthesis));
    });
    const hidden = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", hidden);
    return () => { disposed = true; document.removeEventListener("visibilitychange", hidden); stop(); };
  }, [stop]);

  const listen = useCallback(() => {
    if (!running.current || document.hidden) return;
    const Constructor = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
    if (!Constructor) return;
    const mic = new Constructor();
    recognition.current = mic;
    mic.lang = callbacks.current.language; mic.continuous = false; mic.interimResults = false;
    let received = false;
    mic.onresult = event => {
      if (!running.current || recognition.current !== mic || received) return;
      const text = Array.from(event.results).filter(result => result.isFinal).map(result => result[0].transcript).join(" ").trim();
      if (!text) return;
      received = true;
      mic.onend = null; mic.onerror = null; mic.onresult = null; mic.abort(); recognition.current = null;
      if (text.length > 2000) { stop(); callbacks.current.onError("음성이 길어요. 짧게 나누어 말씀해 주세요."); return; }
      setStatus("AI 답변을 기다리는 중");
      callbacks.current.onTranscript(text);
    };
    mic.onerror = event => {
      if (!running.current || recognition.current !== mic) return;
      stop(); callbacks.current.onError(event.error === "not-allowed" || event.error === "service-not-allowed" ? "마이크 권한이 필요해요. 브라우저 사이트 설정에서 허용한 뒤 다시 시작해 주세요." : "음성을 인식하지 못했어요. 연결과 마이크를 확인한 뒤 다시 시작해 주세요.");
    };
    mic.onend = () => { if (running.current && recognition.current === mic && !received) { stop(); callbacks.current.onError("목소리가 들리지 않았어요. 음성 대화를 다시 시작해 주세요."); } };
    try { mic.start(); setStatus("듣고 있어요. 말씀해 주세요."); }
    catch { stop(); callbacks.current.onError("마이크를 시작할 수 없어요. 잠시 후 다시 시도해 주세요."); }
  }, [stop]);

  const start = useCallback(() => {
    stop(); running.current = true; setActive(true); listen();
  }, [listen, stop]);

  const speak = useCallback((text: string, continueConversation = true) => {
    if (!window.speechSynthesis || (continueConversation && !running.current)) return;
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    utterance.current = speech;
    speech.lang = callbacks.current.language; speech.rate = 0.9;
    const voice = window.speechSynthesis.getVoices().find(item => item.lang.toLowerCase().startsWith(speech.lang.slice(0, 2)));
    if (voice) speech.voice = voice;
    setStatus("AI 답변을 읽고 있어요.");
    speech.onend = () => {
      utterance.current = null;
      if (continueConversation && running.current) timer.current = setTimeout(listen, 250);
      else setStatus("음성 대화 꺼짐");
    };
    speech.onerror = () => { stop(); callbacks.current.onError("답변을 소리 내어 읽지 못했어요. 텍스트로 확인해 주세요."); };
    window.speechSynthesis.speak(speech);
  }, [listen, stop]);

  return { available, active, status, start, stop, speak };
}
