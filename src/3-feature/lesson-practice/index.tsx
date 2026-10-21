"use client";

import { Bookmark, Check, Headphones, Volume2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { LessonPracticeProps } from "./type";

export function LessonPractice({
  lesson,
  saved,
  completed,
  onClose,
  onSave,
  onComplete,
}: LessonPracticeProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [translated, setTranslated] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    dialog.current?.showModal();
    return () => window.speechSynthesis?.cancel();
  }, []);
  function listen(text: string) {
    if (!("speechSynthesis" in window)) {
      setMessage(
        "이 브라우저는 음성 듣기를 지원하지 않습니다. 문장을 소리 내어 읽어 보세요.",
      );
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setMessage(
        "음성을 재생할 수 없습니다. 기기의 음성 설정을 확인해 주세요.",
      );
    };
    setMessage("");
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }
  return (
    <dialog
      className="lesson-practice"
      ref={dialog}
      aria-labelledby="lesson-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="practice-top">
        <span>
          <Headphones size={17} /> LISTEN & PRACTICE
        </span>
        <button autoFocus aria-label="레슨 닫기" onClick={onClose}>
          <X size={21} />
        </button>
      </div>
      <div className={`practice-cover ${lesson.color}`}>
        <span>
          {lesson.category} · {lesson.level}
        </span>
        <h2>{lesson.headline.join(" ")}</h2>
        <p>{lesson.subtitle}</p>
      </div>
      <div className="practice-body">
        <div className="practice-heading">
          <h2 id="lesson-title">{lesson.title}</h2>
          <button
            aria-label={saved ? "저장 취소" : "레슨 저장"}
            aria-pressed={saved}
            onClick={onSave}
          >
            <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
          </button>
        </div>
        <p className="practice-description">
          듣고, 따라 하고, 나의 문장으로 만들어 보세요. 기기의 영어 음성으로
          재생합니다.
        </p>
        <div className="practice-controls">
          <button
            className="listen-all"
            onClick={() =>
              listen(lesson.phrases.map((phrase) => phrase.english).join(". "))
            }
          >
            <Volume2 size={17} />
            {speaking ? "다시 듣기" : "전체 듣기"}
          </button>
          <button
            aria-pressed={translated}
            onClick={() => setTranslated(!translated)}
          >
            {translated ? "해석 숨기기" : "해석 보기"}
          </button>
        </div>
        <ol>
          {lesson.phrases.map((phrase, index) => (
            <li key={phrase.english}>
              <span className="phrase-number">0{index + 1}</span>
              <div>
                <p lang="en">{phrase.english}</p>
                {translated && <span>{phrase.korean}</span>}
              </div>
              <button
                aria-label={`${index + 1}번 문장 듣기`}
                onClick={() => listen(phrase.english)}
              >
                <Volume2 size={18} />
              </button>
            </li>
          ))}
        </ol>
        <p role="status">{message}</p>
        <button className="complete-button" onClick={onComplete}>
          <Check size={18} />
          {completed ? "학습 완료됨" : "오늘의 학습 완료"}
        </button>
      </div>
    </dialog>
  );
}
