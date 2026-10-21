"use client";

import { ArrowLeft, Bookmark, Check, Play, RotateCcw, Volume2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LessonPractice } from "@/src/3-feature";
import { lessons, lessonVideos, useCaptionPreference, useLibrary } from "@/src/4-entity";

import type { WatchWorkspaceProps } from "./type";

export function WatchWorkspace({ lesson }: WatchWorkspaceProps) {
  const video = useRef<HTMLVideoElement>(null);
  const media = lessonVideos[lesson.id];
  const { library, ready, hydrate, update } = useLibrary();
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [rate, setRate] = useState(1);
  const { language: caption, ready: captionReady, hydrate: hydrateCaptions, change: saveCaption } = useCaptionPreference();
  const saved = library.saved.includes(lesson.id);
  const completed = library.completed.includes(lesson.id);
  useEffect(() => {
    // A prerendered video can fail before React attaches its event handlers.
    queueMicrotask(() => { if (video.current?.error) setFailed(true); });
    if (!useCaptionPreference.getState().ready) hydrateCaptions();
    if (!useLibrary.getState().ready) hydrate();
    const current = useLibrary.getState().library;
    if (!update({ ...current, history: [lesson.id, ...current.history.filter(id => id !== lesson.id)] }))
      queueMicrotask(() => setMessage("저장 공간을 사용할 수 없어 이번 세션에서만 유지됩니다."));
    function sync(event: StorageEvent) {
      if (event.key === "mora-english-library" || event.key === null) hydrate();
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [hydrate, hydrateCaptions, update, lesson.id]);
  useEffect(() => {
    const player = video.current;
    if (!player || !captionReady) return;
    for (const track of Array.from(player.textTracks)) track.mode = track.language === caption ? "showing" : "disabled";
    function rememberNativeSelection() {
      if (!player || player.readyState === 0) return;
      const visible = Array.from(player.textTracks).find(track => track.mode === "showing");
      const language = visible?.language === "ko" ? "ko" : visible?.language === "en" ? "en" : "off";
      if (language !== useCaptionPreference.getState().language) saveCaption(language);
    }
    player.textTracks.addEventListener("change", rememberNativeSelection);
    return () => player.textTracks.removeEventListener("change", rememberNativeSelection);
  }, [caption, captionReady, saveCaption]);
  function updateList(key: "saved" | "completed") {
    const current = useLibrary.getState().library;
    if (!update({ ...current, [key]: current[key].includes(lesson.id) ? current[key].filter(id => id !== lesson.id) : [...current[key], lesson.id] }))
      setMessage("저장 공간을 사용할 수 없어 이번 세션에서만 유지됩니다.");
  }
  function seek(seconds: number) {
    if (!video.current || failed) return;
    video.current.currentTime = seconds;
    video.current.play().catch(() => setMessage("영상의 재생 버튼을 눌러 주세요."));
    video.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  function changeCaptions(language: string) {
    if (language !== "en" && language !== "ko" && language !== "off") return;
    if (!saveCaption(language)) setMessage("자막 설정은 이번 세션에서만 유지됩니다.");
    if (!video.current) return;
    for (const track of Array.from(video.current.textTracks)) track.mode = track.language === language ? "showing" : "disabled";
  }
  const related = [...lessons.filter(item => item.id !== lesson.id && item.category === lesson.category), ...lessons.filter(item => item.id !== lesson.id && item.category !== lesson.category)];
  return <div className="watch-workspace" inert={!ready || !captionReady} aria-busy={!ready || !captionReady}>
    <header className="watch-header">
      <Link href="/" className="back-link" aria-label="목록으로 돌아가기"><ArrowLeft size={20} /><span>목록으로</span></Link>
      <Link href="/" className="watch-brand">mora<span>english</span><sup>EN</sup></Link>
      <span className="watch-motto">A little, every day</span>
    </header>
    <main className="watch-layout">
      <div className="watch-primary">
        <div className="player-frame">
          <video key={lesson.id} ref={video} data-testid="lesson-video" src={media.src} controls playsInline preload="metadata" poster={media.poster} aria-label={`${lesson.title} 영어 학습 영상`} onError={() => setFailed(true)} onLoadedMetadata={() => { if (video.current) video.current.playbackRate = rate; const language = useCaptionPreference.getState().language; for (const track of Array.from(video.current?.textTracks || [])) track.mode = track.language === language ? "showing" : "disabled"; }}>
            <track kind="captions" src={`${media.captions}.en.vtt`} srcLang="en" label="English" />
            <track kind="subtitles" src={`${media.captions}.ko.vtt`} srcLang="ko" label="한국어" />
          </video>
          {failed && <div role="alert" className="player-error"><p>영상을 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.</p><button onClick={() => { setFailed(false); video.current?.load(); }}>다시 시도</button></div>}
        </div>
        <div className="player-tools">
          <span><Volume2 size={15} /> 영어 음성 포함 · {media.label}</span>
          <label>재생 속도 <select disabled={!ready} aria-label="영상 재생 속도" value={rate} onChange={event => { const next = Number(event.target.value); setRate(next); if (video.current) { video.current.defaultPlaybackRate = next; video.current.playbackRate = next; } }}><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option></select></label>
          <label>자막 <select disabled={!ready || !captionReady} aria-label="영상 자막" value={caption} onChange={event => changeCaptions(event.target.value)}><option value="en">English</option><option value="ko">한국어</option><option value="off">끄기</option></select></label>
        </div>
        <h1>{lesson.title}</h1>
        <div className="watch-channel">
          <span className="momo-avatar">m.</span><div><strong>Momo&apos;s English</strong><small>{lesson.category} · {lesson.level}</small></div>
          <button disabled={!ready} aria-label={saved ? "저장 취소" : "레슨 저장"} aria-pressed={saved} onClick={() => updateList("saved")}><Bookmark size={17} fill={saved ? "currentColor" : "none"} />{saved ? "저장됨" : "저장"}</button>
          <button disabled={!ready} className={completed ? "done" : "complete"} onClick={() => updateList("completed")}>{completed ? <RotateCcw size={17} /> : <Check size={17} />}{completed ? "학습 완료 취소" : "오늘의 학습 완료"}</button>
        </div>
        <div className="watch-description"><strong>{lesson.subtitle}</strong><p>{lesson.goal}</p><p>{lesson.scenario}</p><span>어휘 3개 · 핵심 문장 5개 · 예시 대화 · 복습</span></div>
        {message && <p role="status">{message}</p>}
        <section className="video-chapters" aria-label="영상 구간"><h2>필요한 순간부터 다시 듣기</h2><div>{[ ["intro", "처음부터"], ["vocabulary", "핵심 어휘"], ["phrase", "핵심 문장"], ["dialogue", "예시 대화"], ["review", "복습"] ].map(([kind, title]) => { const segment = media.segments.find(item => item.kind === kind)!; return <button key={kind} disabled={failed} onClick={() => seek(segment.start)}><Play size={13} /><span>{title}</span><small>{Math.floor(segment.start / 60)}:{String(Math.floor(segment.start % 60)).padStart(2, "0")}</small></button>; })}</div></section>
        <LessonPractice lesson={lesson} onSeek={seek} />
      </div>
      <aside className="watch-related" aria-label="다음 학습 영상"><h2>다음엔 이런 영어</h2>{related.map(item => <Link className="related-video" key={item.id} href={`/watch/${item.id}`}><div><Image src={lessonVideos[item.id].poster} alt={`${item.headline.join(" ")} 영상 프리뷰`} width={1280} height={720} sizes="(max-width: 700px) 45vw, 180px" /><span>{lessonVideos[item.id].label}</span></div><div><h3>{item.title}</h3><p>Momo&apos;s English</p><small>{item.category} · {item.level}</small></div></Link>)}</aside>
    </main>
  </div>;
}
