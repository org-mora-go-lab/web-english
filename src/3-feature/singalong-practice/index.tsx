"use client";

import { Heart, Music2, Play } from "lucide-react";
import { useState } from "react";

import { lessonVideos } from "@/src/4-entity";

import type { SingalongPracticeProps } from "./type";

export function SingalongPractice({ lesson, onSeek }: SingalongPracticeProps) {
  const [translated, setTranslated] = useState(false);
  const lyrics = lessonVideos[lesson.id].segments.filter(segment => segment.kind === "song");
  return <section className="singalong-practice" aria-label="동요 가사와 함께 놀이">
    <div className="song-lyrics-heading"><div><span><Music2 size={15} /> SING, MOVE & SMILE</span><h2>함께 불러요</h2></div><button onClick={() => setTranslated(!translated)} aria-pressed={translated}>{translated ? "해석 숨기기" : "해석 보기"}</button></div>
    <p className="lyrics-intro">한 구절을 눌러 다시 듣고, 아이의 반응을 기다려 주세요.</p>
    <ol className="song-lyrics">{lyrics.map((line, index) => <li key={line.start}><button aria-label={`${index + 1}번 동요 구절 재생`} onClick={() => onSeek(line.start)}><span className="lyric-number">0{index + 1}</span><div><strong lang="en">{line.text}</strong>{translated && <small>{line.korean}</small>}</div><Play size={17} /></button></li>)}</ol>
    <details className="parent-play"><summary><Heart size={16} /> 보호자와 함께 해 봐요</summary><p>{lesson.scenario}</p><div className="play-words">{lesson.vocabulary.map(item => <span key={item.word}><strong lang="en">{item.word}</strong>{item.meaning}</span>)}</div><p>{lesson.tip}</p></details>
    <p className="original-song-note">Mora Little Friends 오리지널 동요 · 가사와 멜로디, 반주를 직접 제작한 합성 음성 노래입니다.</p>
  </section>;
}
