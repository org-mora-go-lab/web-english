"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { welcomeVideo } from "./constant";
import type { CharacterWelcomeProps } from "./type";

export function CharacterWelcome({ suspended }: CharacterWelcomeProps) {
  const player = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = player.current;
    if (!video) return;
    const syncPlayback = () => setPlaying(!video.paused);
    const syncVolume = () => setMuted(video.muted || video.volume === 0);
    const syncError = () => {
      if (video.error) {
        setFailed(true);
        setError(
          "영상을 불러오지 못했어요. 페이지를 새로고침한 후 다시 재생해 주세요.",
        );
      }
    };
    video.addEventListener("play", syncPlayback);
    video.addEventListener("pause", syncPlayback);
    video.addEventListener("volumechange", syncVolume);
    video.addEventListener("error", syncError);
    queueMicrotask(() => {
      syncPlayback();
      syncVolume();
      syncError();
    });
    return () => {
      video.removeEventListener("play", syncPlayback);
      video.removeEventListener("pause", syncPlayback);
      video.removeEventListener("volumechange", syncVolume);
      video.removeEventListener("error", syncError);
    };
  }, []);
  useEffect(() => {
    if (suspended) player.current?.pause();
  }, [suspended]);

  async function toggleVoice() {
    const video = player.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
    if (!next) {
      if (video.volume === 0) video.volume = 0.85;
      video.currentTime = 0;
      try {
        await video.play();
        setError("");
      } catch {
        setError("영상의 재생 버튼을 눌러 Momo의 목소리를 들어 보세요.");
      }
    }
  }

  return (
    <section className="character-welcome" aria-label="Momo의 영어 인사">
      <div className="video-stage">
        <video
          ref={player}
          aria-label="Momo의 영어 인사 영상"
          data-testid="momo-video"
          src={welcomeVideo.src}
          poster={welcomeVideo.poster}
          autoPlay
          muted={muted}
          loop
          playsInline
          controls
          preload="auto"
        >
          <track
            kind="captions"
            src="/media/momo-welcome.en.vtt"
            srcLang="en"
            label="English"
          />
          <track
            kind="subtitles"
            src="/media/momo-welcome.ko.vtt"
            srcLang="ko"
            label="한국어"
          />
          이 브라우저에서는 영상을 재생할 수 없습니다. 아래 대본을 읽으며 영어
          인사를 연습해 보세요.
        </video>
        <span className="video-badge">MEET MOMO · 20 SEC</span>
      </div>
      <div className="video-actions">
        <div>
          <strong>영어 친구 Momo를 만나 보세요</strong>
          <span>
            {playing
              ? "영어 자막과 함께 재생 중"
              : "재생 버튼을 눌러 인사해 보세요"}
          </span>
        </div>
        <button
          type="button"
          disabled={failed}
          aria-pressed={!muted}
          onClick={toggleVoice}
        >
          {muted ? <Volume2 size={16} /> : <VolumeX size={16} />}
          {muted ? "목소리 듣기" : "음소거"}
        </button>
      </div>
      {error && (
        <p className="video-message" role="alert">
          {error}
        </p>
      )}
      <details className="video-transcript">
        <summary>영어 대본과 해석 보기</summary>
        <ol>
          {welcomeVideo.segments.map((line) => (
            <li key={line.text}>
              <p lang="en">{line.text}</p>
              <span>{line.korean}</span>
            </li>
          ))}
        </ol>
      </details>
    </section>
  );
}
