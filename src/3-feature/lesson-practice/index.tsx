"use client";

import {
  Bookmark,
  Check,
  Headphones,
  RotateCcw,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useSpeech } from "./hook";
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
  const [answer, setAnswer] = useState<number | null>(null);
  const { listen, stop, speaking, rate, changeRate, message } = useSpeech();
  useEffect(() => {
    dialog.current?.showModal();
  }, []);
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
          {lesson.category} · {lesson.level} · {lesson.duration}
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
        <p className="practice-description">{lesson.goal}</p>
        <div className="lesson-context">
          <span>이런 상황에서 써요</span>
          <p>{lesson.scenario}</p>
        </div>
        <div className="vocabulary" aria-label="핵심 어휘">
          {lesson.vocabulary.map((item) => (
            <span key={item.word}>
              <strong lang="en">{item.word}</strong>
              {item.meaning}
            </span>
          ))}
        </div>
        <h3>01. 핵심 문장 듣고 따라 하기</h3>
        <p className="audio-note">
          기기의 영어 음성으로 재생됩니다. 속도를 바꿔 반복해 보세요.
        </p>
        <div className="practice-controls">
          <button
            className="listen-all"
            onClick={() =>
              listen(lesson.phrases.map((phrase) => phrase.english).join(" "))
            }
          >
            <Volume2 size={17} />
            전체 듣기
          </button>
          {speaking && (
            <button className="stop-audio" onClick={stop}>
              <Square size={14} fill="currentColor" />
              듣기 중지
            </button>
          )}
          <label className="rate-label">
            속도
            <select
              aria-label="듣기 속도"
              value={rate}
              onChange={(event) => changeRate(Number(event.target.value))}
            >
              <option value={0.7}>느리게</option>
              <option value={0.85}>기본</option>
              <option value={1}>보통</option>
            </select>
          </label>
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
        <p className="speech-status" role="status" aria-live="polite">
          {message || (speaking ? "영어 음성을 재생하고 있어요." : "")}
        </p>
        <section className="dialogue-section" aria-label="예시 대화">
          <h3>02. 대화 속에서 연결하기</h3>
          {lesson.dialogue.map((line, index) => (
            <div className="dialogue-line" key={`${index}-${line.speaker}`}>
              <span>{line.speaker}</span>
              <div>
                <p lang="en">{line.english}</p>
                {translated && <small>{line.korean}</small>}
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              listen(lesson.dialogue.map((line) => line.english).join(" "))
            }
          >
            <Headphones size={16} />
            대화 듣기
          </button>
        </section>
        <aside className="practice-tip">
          <strong>표현을 내 것으로</strong>
          <p>{lesson.tip}</p>
        </aside>
        <fieldset className="quick-check">
          <legend>03. 이해도 확인</legend>
          <p>{lesson.quiz.question}</p>
          {lesson.quiz.options.map((option, index) => (
            <button
              key={option}
              type="button"
              aria-pressed={answer === index}
              className={answer === index ? "chosen" : ""}
              onClick={() => setAnswer(index)}
            >
              {String.fromCharCode(65 + index)}
              <span>{option}</span>
            </button>
          ))}
          {answer !== null && (
            <div
              className={
                answer === lesson.quiz.answer ? "quiz-correct" : "quiz-retry"
              }
              role="status"
            >
              <strong>
                {answer === lesson.quiz.answer
                  ? "정답이에요!"
                  : "다시 생각해 보세요."}
              </strong>
              <p>
                {answer === lesson.quiz.answer
                  ? lesson.quiz.explanation
                  : "상황에 맞는 표현을 다시 골라 보세요."}
              </p>
            </div>
          )}
        </fieldset>
        <button className="complete-button" onClick={onComplete}>
          {completed ? <RotateCcw size={18} /> : <Check size={18} />}
          {completed ? "학습 완료 취소" : "오늘의 학습 완료"}
        </button>
      </div>
    </dialog>
  );
}
