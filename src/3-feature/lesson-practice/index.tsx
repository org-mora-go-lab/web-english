"use client";

import { Play } from "lucide-react";
import { useState } from "react";

import { lessonVideos } from "@/src/4-entity";

import type { LessonPracticeProps } from "./type";

export function LessonPractice({ lesson, onSeek }: LessonPracticeProps) {
  const [translated, setTranslated] = useState(false);
  const [answer, setAnswer] = useState<number | null>(null);
  const phrases = lessonVideos[lesson.id].segments.filter(item => item.kind === "phrase");
  const dialogue = lessonVideos[lesson.id].segments.filter(item => item.kind === "dialogue");
  return <section className="lesson-practice" aria-label="영상 대본과 연습">
    <div className="transcript-heading"><div><span>LISTEN & PRACTICE</span><h2>영상과 함께, 한 문장씩</h2></div><button aria-pressed={translated} onClick={() => setTranslated(!translated)}>{translated ? "해석 숨기기" : "해석 보기"}</button></div>
    <div className="vocabulary" aria-label="핵심 어휘">{lesson.vocabulary.map(item => <span key={item.word}><strong lang="en">{item.word}</strong>{item.meaning}</span>)}</div>
    <h3>01. 핵심 문장 듣고 따라 하기</h3>
    <p className="audio-note">문장 옆 재생 버튼을 누르면 영상의 해당 구간으로 이동해요.</p>
    <ol>{lesson.phrases.map((phrase, index) => <li key={phrase.english}><span className="phrase-number">0{index + 1}</span><div><p lang="en">{phrase.english}</p>{translated && <span>{phrase.korean}</span>}</div><button aria-label={`${index + 1}번 문장 영상 재생`} onClick={() => onSeek(phrases[index].start)}><Play size={17} /></button></li>)}</ol>
    <section className="dialogue-section" aria-label="예시 대화"><h3>02. 대화 속에서 연결하기</h3>{lesson.dialogue.map((line, index) => <div className="dialogue-line" key={index}><span>{line.speaker}</span><div><p lang="en">{line.english}</p>{translated && <small>{line.korean}</small>}</div><button aria-label={`${index + 1}번 대화 영상 재생`} onClick={() => onSeek(dialogue[index].start)}><Play size={16} /></button></div>)}</section>
    <aside className="practice-tip"><strong>표현을 내 것으로</strong><p>{lesson.tip}</p></aside>
    <fieldset className="quick-check"><legend>03. 이해도 확인</legend><p>{lesson.quiz.question}</p>{lesson.quiz.options.map((option, index) => <button key={option} type="button" aria-pressed={answer === index} className={answer === index ? "chosen" : ""} onClick={() => setAnswer(index)}>{String.fromCharCode(65 + index)}<span>{option}</span></button>)}{answer !== null && <div className={answer === lesson.quiz.answer ? "quiz-correct" : "quiz-retry"} role="status"><strong>{answer === lesson.quiz.answer ? "정답이에요!" : "다시 생각해 보세요."}</strong><p>{answer === lesson.quiz.answer ? lesson.quiz.explanation : "상황에 맞는 표현을 다시 골라 보세요."}</p></div>}</fieldset>
  </section>;
}
