import { useEffect, useRef, useState } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [rate, setRate] = useState(0.85);
  const [message, setMessage] = useState("");
  const current = useRef<SpeechSynthesisUtterance | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  function stop() {
    current.current = null;
    clearTimeout(timer.current);
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }
  useEffect(
    () => () => {
      current.current = null;
      clearTimeout(timer.current);
      window.speechSynthesis?.cancel();
    },
    [],
  );
  function listen(text: string) {
    stop();
    if (
      !window.speechSynthesis ||
      typeof window.SpeechSynthesisUtterance !== "function"
    ) {
      setMessage(
        "이 브라우저는 음성 듣기를 지원하지 않습니다. 영어 문장을 소리 내어 읽으며 연습해 보세요.",
      );
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      current.current = utterance;
      utterance.lang = "en-US";
      utterance.rate = rate;
      const voice = window.speechSynthesis
        .getVoices()
        .find((item) => item.lang.startsWith("en"));
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        if (current.current === utterance) clearTimeout(timer.current);
      };
      utterance.onend = () => {
        if (current.current !== utterance) return;
        current.current = null;
        clearTimeout(timer.current);
        setSpeaking(false);
      };
      utterance.onerror = () => {
        if (current.current !== utterance) return;
        current.current = null;
        clearTimeout(timer.current);
        setSpeaking(false);
        setMessage(
          "음성을 재생할 수 없습니다. 기기의 영어 음성 설정을 확인한 후 다시 시도해 주세요.",
        );
      };
      setMessage("");
      setSpeaking(true);
      timer.current = setTimeout(() => {
        if (current.current !== utterance) return;
        stop();
        setMessage(
          "음성 재생이 시작되지 않았습니다. 기기에 영어 음성이 설치되어 있는지 확인해 주세요.",
        );
      }, 8000);
      window.speechSynthesis.speak(utterance);
    } catch {
      stop();
      setMessage(
        "음성을 재생할 수 없습니다. 영어 문장을 읽으며 연습해 보세요.",
      );
    }
  }
  function changeRate(value: number) {
    stop();
    setRate(value);
  }
  return { listen, stop, speaking, rate, changeRate, message };
}
