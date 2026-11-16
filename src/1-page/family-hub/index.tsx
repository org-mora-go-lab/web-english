"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AiChat } from "@/src/3-feature";
import { AccountIdentity } from "@/src/4-entity/account/client";
import type { PlayActivity } from "@/src/4-entity/family";
import { activityById, agePeriods, periodForAge, playActivities } from "@/src/4-entity/family";

import { ActivityCard } from "./component";
import type { FamilyHubProps } from "./type";

type RecordItem = { id: string; activityId: string; ageMonths: number; reaction: "enjoyed" | "noticed" | "retry"; note: string; playedAt: number };
type View = "today" | "curriculum" | "records" | "guide";
const reactions = [{ id: "enjoyed", label: "즐거워했어요", icon: "♡" }, { id: "noticed", label: "관심 보였어요", icon: "✦" }, { id: "retry", label: "다음에 다시", icon: "↺" }] as const;
const viewLabels: { id: View; label: string; icon: string }[] = [{ id: "today", label: "오늘", icon: "⌂" }, { id: "curriculum", label: "커리큘럼", icon: "▦" }, { id: "records", label: "놀이 기록", icon: "◷" }, { id: "guide", label: "부모 가이드", icon: "♡" }];

export function FamilyHub({ viewer }: FamilyHubProps) {
  const [sidebar, setSidebar] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [meowing, setMeowing] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  useEffect(() => () => { audioRef.current?.pause(); }, []);
  const [view, setView] = useState<View>("today");
  const [age, setAge] = useState(16);
  const ageRef = useRef(16);
  const [period, setPeriod] = useState("prep");
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [selected, setSelected] = useState<PlayActivity | null>(null);
  const [reaction, setReaction] = useState<RecordItem["reaction"]>("enjoyed");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [profileReady, setProfileReady] = useState(!viewer);
  const [ageSaving, setAgeSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!viewer) return;
    const controller = new AbortController();
    fetch("/api/family", { signal: controller.signal }).then(response => response.ok ? response.json() : null).then(data => {
      if (!controller.signal.aborted && data) { ageRef.current = data.ageMonths; setAge(data.ageMonths); setPeriod(periodForAge(data.ageMonths)); setRecords(data.records); }
    }).catch(() => { if (!controller.signal.aborted) setMessage("기록을 불러오지 못했습니다. 새로고침해 주세요."); }).finally(() => { if (!controller.signal.aborted) setProfileReady(true); });
    return () => controller.abort();
  }, [viewer]);
  const currentPeriod = agePeriods.find(item => item.id === periodForAge(age))!;
  const selectedPeriod = agePeriods.find(item => item.id === period)!;
  const periodActivities = playActivities.filter(item => item.months === period);
  const activeDays = useMemo(() => new Set(records.map(item => new Date(item.playedAt).toDateString())).size, [records]);

  async function saveAge(value: number) {
    ageRef.current = value;
    setAge(value); setPeriod(periodForAge(value));
    if (!viewer) return;
    setAgeSaving(true);
    try {
      const response = await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ageMonths: value }) });
      if (!response.ok) throw new Error();
    } catch { setMessage("개월수 저장에 실패했습니다. 다시 선택해 주세요."); }
    finally { setAgeSaving(false); }
  }
  async function saveRecord() {
    if (!selected || !viewer) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityId: selected.id, reaction, note }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRecords(current => [data.record, ...current]); setSelected(null); setNote(""); setView("records"); setMessage("놀이 기록을 저장했어요.");
    } catch { setMessage("기록 저장에 실패했습니다. 다시 시도해 주세요."); }
    finally { setBusy(false); }
  }
  async function removeRecord(id: string) {
    if (!viewer) return;
    const response = await fetch(`/api/family?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setRecords(current => current.filter(item => item.id !== id));
    else setMessage("기록 삭제에 실패했습니다.");
  }
  function openActivity(activity: PlayActivity) { setSelected(activity); setReaction("enjoyed"); setNote(""); }
  function openTodayActivity() { const activity = playActivities.find(item => item.months === periodForAge(ageRef.current)); if (activity) openActivity(activity); }
  async function meow() {
    setTapCount(count => count + 1);
    if (!audioRef.current) audioRef.current = new Audio("/media/kitten-meow.wav");
    const audio = audioRef.current;
    audio.pause(); audio.currentTime = 0; audio.volume = 0.35;
    audio.onended = () => setMeowing(false);
    try { await audio.play(); setMeowing(true); } catch { setMessage("소리를 재생하지 못했어요. 다시 눌러 주세요."); }
  }
  return <div className="family-hub">
    <button className="mobile-menu" aria-label={sidebar ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={sidebar} onClick={() => setSidebar(!sidebar)}>☰</button>
    {sidebar && <button className="sidebar-backdrop" aria-label="메뉴 배경 닫기" onClick={() => setSidebar(false)} />}
    <aside className={`family-sidebar ${sidebar ? "is-open" : ""}`} aria-label="콘텐츠 메뉴">
      <Link href="/" className="family-brand"><span className="brand-mark">m.</span><span>mora <b>little english</b></span></Link>
      <p className="sidebar-caption">작은 놀이, 함께하는 영어</p>
      <nav aria-label="주 메뉴">{viewLabels.map(item => <button key={item.id} aria-current={view === item.id ? "page" : undefined} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setSidebar(false); }}><span aria-hidden="true">{item.icon}</span>{item.label}</button>)}<Link href="/ai" aria-label="AI 영어 도우미" className="sidebar-ai-link">✦ AI 영어 도우미</Link></nav>
      <div className="sidebar-age"><label htmlFor="child-age">현재 개월수</label><select id="child-age" aria-label="아이 개월수" value={age} disabled={!profileReady || ageSaving} onChange={event => void saveAge(Number(event.target.value))}>{Array.from({length: 21}, (_, i) => i + 16).map(month => <option key={month} value={month}>{month}개월</option>)}</select><p>{currentPeriod.label} · {currentPeriod.focus}</p></div>
      <div className="sidebar-bottom"><p>♡ 함께한 날 {viewer ? `${activeDays}일` : "—"}</p><div className="family-account">{viewer ? <><Link href="/settings/account"><AccountIdentity displayName={viewer.displayName} profileImageUrl={viewer.profileImageUrl} compact /></Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></> : <Link className="login-link" href="/login?callbackUrl=/">부모 로그인</Link>}</div></div>
    </aside>
    <div className="family-content"><header className="play-header"><span>Mora Little English <small>함께 놀고, 함께 자라요</small></span><button onClick={() => setView("guide")}>♡ 부모님</button></header>
    <main className="family-main">
      {message && <p role="status" className="family-message">{message}</p>}
      {view === "today" && <section className="cat-play"><span className="eyebrow">HELLO, LITTLE FRIEND</span><h1>야옹! 나랑 같이 놀자.</h1><p>고양이를 톡 누르고 인사해요.</p><button className={`cat-button ${meowing ? "meowing" : ""}`} aria-label="고양이 야옹 소리 듣기" onClick={() => void meow()}><Image key={tapCount} src="/media/singalong/characters/kitten.png" alt="웃으며 인사하는 주황색 아기 고양이" width={460} height={460} priority /><span className="cat-bubble">{meowing ? "Meow! ♡" : "Hi, friend!"}</span></button><button className="cat-action" onClick={() => void meow()}>Tap the cat! <span>고양이를 톡!</span></button><button className="text-button today-guide" disabled={ageSaving || !profileReady} onClick={openTodayActivity}>오늘의 놀이 보기 →</button></section>}
      {view === "curriculum" && <><section className="inner-hero"><span className="eyebrow">18 TO 36 MONTHS · EVERY 3 MONTHS</span><h1>아이의 속도를 따라가는<br /><em>3개월 커리큘럼</em></h1><p>16~17개월은 준비 단계예요. 18개월부터는 3개월 단위 놀이를 참고해 주세요.</p></section><section className="family-section"><div className="period-tabs" role="tablist" aria-label="개월수별 단계">{agePeriods.map(item => <button role="tab" aria-selected={period === item.id} className={period === item.id ? "active" : ""} key={item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div><div className="period-intro"><span className="eyebrow">{selectedPeriod.label}</span><h2>{selectedPeriod.focus}</h2><p>{selectedPeriod.cue}</p></div><div className="activity-grid">{periodActivities.map(activity => <ActivityCard key={activity.id} activity={activity} onOpen={openActivity} />)}</div></section></>}
      {view === "records" && <><section className="inner-hero"><span className="eyebrow">FAMILY MEMORY · NO SCORES</span><h1>함께한 순간을<br /><em>한 줄로 기억해요.</em></h1><p>아이의 영어 실력을 평가하지 않아요. 아이가 좋아한 놀이를 다음에 다시 해보세요.</p></section><section className="family-section"><div className="section-heading"><div><span className="eyebrow">PLAY JOURNAL</span><h2>놀이 기록 {records.length}개</h2></div><button className="text-button" onClick={() => setView("curriculum")}>놀이 카드 고르기 →</button></div>{!viewer ? <div className="empty-record"><span>♡</span><h3>로그인하고 놀이 기록을 남겨보세요.</h3><p>로그인하면 다른 기기에서도 기록을 볼 수 있어요.</p><Link className="primary-button" href="/login?callbackUrl=/">로그인하기</Link></div> : records.length ? <div className="record-list">{records.map(item => { const activity = activityById(item.activityId); return <article className="record-row" key={item.id}><div className="record-emoji">{activity?.icon ?? "♡"}</div><div><span className="record-date">{new Date(item.playedAt).toLocaleDateString("ko-KR")} · {item.ageMonths}개월</span><h3>{activity?.title ?? "영어 놀이"}</h3><p>{reactions.find(value => value.id === item.reaction)?.label}{item.note && ` · ${item.note}`}</p></div><button aria-label={`${activity?.title ?? "영어 놀이"} 기록 삭제`} onClick={() => void removeRecord(item.id)}>삭제</button></article>; })}</div> : <div className="empty-record"><span>♡</span><h3>아직 기록이 없어요.</h3><p>오늘 함께 웃은 순간 하나부터 남겨 보세요.</p><button className="primary-button" onClick={() => setView("today")}>오늘의 놀이 보기</button></div>}</section></>}
      {view === "guide" && <><section className="inner-hero"><span className="eyebrow">A GUIDE FOR PARENTS</span><h1>부모가 보고,<br /><em>아이는 화면 밖에서 놀아요.</em></h1><p>짧게 준비하고, 함께 움직이고, 부담 없이 마무리하는 방식입니다.</p></section><section className="family-section"><div className="guide-steps"><article><span>01 · 준비</span><h2>카드 한 장, 20초</h2><p>실제 생활의 한 장면을 골라 영어 한마디만 읽어요. 준비물은 집에 있는 물건이면 충분해요.</p></article><article><span>02 · 함께</span><h2>화면을 내려놓고</h2><p>부모가 먼저 말하고 몸짓을 보여줘요. 아이가 관심을 보이는 대상과 속도를 따라가요.</p></article><article><span>03 · 마무리</span><h2>기억할 순간만 기록</h2><p>좋아했는지, 바라봤는지, 다음에 다시 해볼지만 남겨요. 말하기와 정답을 요구하지 않아요.</p></article></div><div className="guide-note"><h2>우리 가족의 원칙</h2><ul><li>한 번에 3~5분이면 충분해요. 아이가 싫어하면 바로 멈춰요.</li><li>영어를 따라 말하지 않아도 괜찮아요. 한국어로 자연스럽게 이어가세요.</li><li>큰 장난감과 안전한 장소를 사용하고, 산책 중에는 교통 안전을 먼저 챙겨요.</li><li>개월수는 놀이를 고르는 참고 기준이에요. 36개월에는 좋아한 놀이를 다시 골라요.</li></ul></div></section></>}
    </main>
    <div className="chat-dock"><AiChat signedIn={Boolean(viewer)} embedded /></div></div>
    {selected && <div className="activity-overlay" role="presentation" onClick={() => setSelected(null)}><section className="activity-dialog" role="dialog" aria-modal="true" aria-label={`${selected.title} 놀이 가이드`} onClick={event => event.stopPropagation()}><button className="close-dialog" aria-label="닫기" onClick={() => setSelected(null)}>×</button><div className="dialog-icon">{selected.icon}</div><span className="eyebrow">{selected.months === "prep" ? "16–17개월 준비" : `${selected.months}개월 단계`} · {selected.theme}</span><h2>{selected.title}</h2><div className="phrase-box"><span>오늘의 한마디</span><strong>{selected.phrase}</strong><p>{selected.meaning}</p></div><div className="dialog-guide"><h3>이렇게 해보세요</h3><p>{selected.steps}</p><h3>부모님께</h3><p>{selected.parentTip}</p></div>{viewer ? <div className="record-form"><h3>놀이 뒤에만 기록해요</h3><div className="reaction-options">{reactions.map(item => <button key={item.id} className={reaction === item.id ? "selected" : ""} onClick={() => setReaction(item.id)}>{item.icon} {item.label}</button>)}</div><textarea aria-label="한 줄 메모" maxLength={300} placeholder="아이의 관심이나 즐거웠던 순간을 한 줄로 (선택)" value={note} onChange={event => setNote(event.target.value)} /><button className="primary-button" disabled={busy} onClick={() => void saveRecord()}>{busy ? "저장 중…" : "놀이 기록 저장"}</button></div> : <Link className="primary-button" href="/login?callbackUrl=/">로그인하고 기록하기</Link>}</section></div>}
  </div>;
}

