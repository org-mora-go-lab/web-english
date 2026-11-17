"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import type { PlayChatCardProps } from "./type";

export function PlayChatCard({ activity, onStartToday, onRecord, disabled = false }: PlayChatCardProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRef = useRef(0);
  const [tapCount, setTapCount] = useState(0);
  const [meowing, setMeowing] = useState(false);
  const [soundError, setSoundError] = useState("");

  useEffect(() => () => {
    playbackRef.current += 1;
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  async function playMeow() {
    const playback = ++playbackRef.current;
    setTapCount(count => count + 1);
    setSoundError("");
    if (!audioRef.current) audioRef.current = new Audio("/media/kitten-meow.wav");
    const audio = audioRef.current;
    audio.pause();
    audio.currentTime = 0;
    audio.volume = .35;
    audio.onended = () => { if (playbackRef.current === playback) setMeowing(false); };
    try {
      await audio.play();
      if (playbackRef.current === playback) setMeowing(true);
    } catch {
      if (playbackRef.current === playback) {
        setMeowing(false);
        setSoundError("소리를 재생하지 못했어요. 고양이를 다시 눌러 주세요.");
      }
    }
  }

  const Root = activity ? "article" : "section";

  return <Root className={`play-chat-card ${activity ? "has-activity" : "is-welcome"}`} aria-label={activity ? `${activity.title} 학습 카드` : "고양이와 영어 놀이"}>
    <div className="play-chat-card-art">
      <button className={`play-chat-card-cat ${meowing ? "is-meowing" : ""}`} type="button" aria-label="고양이 야옹 소리 듣기" onClick={() => void playMeow()}>
        <Image key={tapCount} src="/media/singalong/characters/kitten.png" alt="반갑게 인사하는 주황색 아기 고양이" width={280} height={280} priority={!activity} />
        <span className="play-chat-card-bubble" aria-hidden="true">{meowing ? "Meow! ♡" : "Hi, friend!"}</span>
      </button>
      {!activity && <span className="play-chat-card-tap">고양이를 톡 눌러 인사해요.</span>}
    </div>
    <div className="play-chat-card-content">
      {activity ? <>
        <div className="play-chat-card-topic"><span aria-hidden="true">{activity.icon}</span><span>{activity.theme} · {activity.scene}</span></div>
        <h3>{activity.title}</h3>
        <div className="play-chat-card-phrase"><strong>{activity.phrase}</strong><p>{activity.meaning}</p></div>
        <details className="play-chat-card-guide"><summary>놀이 방법과 부모 가이드</summary><p>{activity.steps}</p><div><span>부모님께</span><p>{activity.parentTip}</p></div></details>
        {onRecord && <button className="play-chat-card-record" type="button" onClick={onRecord}>놀이 기록 남기기 <span aria-hidden="true">↗</span></button>}
      </> : <>
        <span className="play-chat-card-eyebrow">A LITTLE ENGLISH, A LITTLE PLAY</span>
        <h1>야옹! 나랑 같이 놀자.</h1>
        <p className="play-chat-card-description">영어 놀이를 고르면 그 이야기를 함께 이어가요.<br />오늘은 어떤 놀이를 해볼까요?</p>
        {onStartToday && <button className="play-chat-card-start" type="button" disabled={disabled} onClick={onStartToday}>오늘의 놀이 보기 <span aria-hidden="true">→</span></button>}
      </>}
    </div>
    {soundError && <p className="play-chat-card-sound-error" role="status">{soundError}</p>}
  </Root>;
}
