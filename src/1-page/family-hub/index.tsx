"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";

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
  const [view, setView] = useState<View>("today");
  const [age, setAge] = useState(16);
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
    fetch("/api/family").then(response => response.ok ? response.json() : null).then(data => {
      if (data) { setAge(data.ageMonths); setPeriod(periodForAge(data.ageMonths)); setRecords(data.records); }
    }).catch(() => setMessage("기록을 불러오지 못했습니다. 새로고침해 주세요.")).finally(() => setProfileReady(true));
  }, [viewer]);
  const currentPeriod = agePeriods.find(item => item.id === periodForAge(age))!;
  const todayActivities = playActivities.filter(item => item.months === currentPeriod.id);
  const selectedPeriod = agePeriods.find(item => item.id === period)!;
  const periodActivities = playActivities.filter(item => item.months === period);
  const activeDays = useMemo(() => new Set(records.map(item => new Date(item.playedAt).toDateString())).size, [records]);

  async function saveAge(value: number) {
    setAge(value); setPeriod(periodForAge(value));
    if (!viewer) return;
    setAgeSaving(true);
    try {
      const response = await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ageMonths: value }) });
      if (!response.ok) throw new Error();
    } catch { setMessage("월령 저장에 실패했습니다. 다시 선택해 주세요."); }
    finally { setAgeSaving(false); }
  }
  async function saveRecord() {
    if (!selected || !viewer) return;
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/family", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activityId: selected.id, reaction, note }) });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setRecords(current => [data.record, ...current]); setSelected(null); setNote(""); setView("records"); setMessage("놀이 순간을 기록했어요.");
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
  return <div className="family-hub">
    <header className="family-header"><Link href="/" className="family-brand"><span className="brand-mark">m.</span><span>mora <b>little english</b></span></Link><nav aria-label="주 메뉴">{viewLabels.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}</nav><div className="family-account">{viewer ? <><Link href="/settings/account"><AccountIdentity displayName={viewer.displayName} profileImageUrl={viewer.profileImageUrl} compact /></Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></> : <Link className="login-link" href="/login?callbackUrl=/">부모 로그인</Link>}</div></header>
    <main className="family-main">
      {message && <p role="status" className="family-message">{message}</p>}
      {view === "today" && <><section className="family-hero"><div><span className="eyebrow">TODAY&apos;S LITTLE MOMENT · 부모를 위한 영어 놀이</span><h1>하루 한 장,<br /><em>아이와 영어 한마디.</em></h1><p>부모가 먼저 읽고, 화면을 내려놓으세요.<br />아이와 함께한 순간만 가볍게 남기면 충분합니다.</p><button className="primary-button" disabled={ageSaving || !profileReady} onClick={() => openActivity(todayActivities[0])}>오늘의 놀이 보기 <span>↗</span></button></div><div className="hero-art" aria-hidden="true"><span className="sun">☀</span><span className="speech speech-one">Hi!</span><span className="speech speech-two">♡</span><div className="art-face"><span>●　●</span><strong>⌣</strong></div><div className="art-floor" /></div></section>
        <section className="family-overview"><div className="section-heading"><div><span className="eyebrow">OUR LITTLE JOURNEY</span><h2>우리 아이의 지금</h2></div><span className="soft-tag">평가 없이, 우리 속도로</span></div><div className="overview-grid"><div className="overview-card age-card"><span className="card-icon">◌</span><h3>현재 월령</h3><div className="age-select"><select aria-label="아이 월령" value={age} disabled={!profileReady || ageSaving} onChange={event => void saveAge(Number(event.target.value))}>{Array.from({ length: 21 }, (_, index) => index + 16).map(month => <option key={month} value={month}>{month}개월</option>)}</select><span>⌄</span></div><p>아이의 월령에 맞는 놀이를 보여드려요.</p></div><div className="overview-card"><span className="card-icon">✦</span><h3>이번 단계</h3><strong>{currentPeriod.label}</strong><p>{currentPeriod.focus}</p></div><div className="overview-card"><span className="card-icon">♡</span><h3>함께한 날</h3><strong>{viewer ? `${activeDays}일` : "—"}</strong><p>{viewer ? "기록한 놀이 날짜를 세었어요." : "로그인 후 기록을 저장할 수 있어요."}</p></div></div></section>
        <section className="family-section"><div className="section-heading"><div><span className="eyebrow">READY IN 20 SECONDS</span><h2>이번 월령의 놀이 카드</h2></div><button className="text-button" onClick={() => setView("curriculum")}>전체 커리큘럼 →</button></div><div className="activity-grid">{todayActivities.map(activity => <ActivityCard key={activity.id} activity={activity} onOpen={openActivity} />)}</div></section>
        <section className="parent-promise"><span className="promise-icon">✳</span><div><h2>아이가 말하지 않아도 괜찮아요.</h2><p>오늘은 부모의 목소리, 몸짓, 기다림만으로 충분합니다. 영어는 놀이를 돕는 작은 도구예요.</p></div><button onClick={() => setView("guide")}>부모 가이드 보기 →</button></section></>}
      {view === "curriculum" && <><section className="inner-hero"><span className="eyebrow">18 TO 36 MONTHS · EVERY 3 MONTHS</span><h1>아이의 속도를 따라가는<br /><em>3개월 커리큘럼</em></h1><p>현재 16개월은 준비 단계예요. 18개월부터는 월령별 제안을 가볍게 참고하세요.</p></section><section className="family-section"><div className="period-tabs" role="tablist" aria-label="월령 단계">{agePeriods.map(item => <button role="tab" aria-selected={period === item.id} className={period === item.id ? "active" : ""} key={item.id} onClick={() => setPeriod(item.id)}>{item.label}</button>)}</div><div className="period-intro"><span className="eyebrow">{selectedPeriod.label}</span><h2>{selectedPeriod.focus}</h2><p>{selectedPeriod.cue}</p></div><div className="activity-grid">{periodActivities.map(activity => <ActivityCard key={activity.id} activity={activity} onOpen={openActivity} />)}</div></section></>}
      {view === "records" && <><section className="inner-hero"><span className="eyebrow">FAMILY MEMORY · NO SCORES</span><h1>함께한 순간을<br /><em>한 줄로 기억해요.</em></h1><p>아이의 영어 성취를 평가하지 않아요. 좋아한 놀이와 관심을 다음 활동에 이어 주세요.</p></section><section className="family-section"><div className="section-heading"><div><span className="eyebrow">PLAY JOURNAL</span><h2>놀이 기록 {records.length}개</h2></div><button className="text-button" onClick={() => setView("curriculum")}>놀이 카드 고르기 →</button></div>{!viewer ? <div className="empty-record"><span>♡</span><h3>부모 계정으로 기록을 이어가세요.</h3><p>기기 간 기록은 로그인 후 Turso에 저장됩니다.</p><Link className="primary-button" href="/login?callbackUrl=/">로그인하기</Link></div> : records.length ? <div className="record-list">{records.map(item => { const activity = activityById(item.activityId); return <article className="record-row" key={item.id}><div className="record-emoji">{activity?.icon ?? "♡"}</div><div><span className="record-date">{new Date(item.playedAt).toLocaleDateString("ko-KR")} · {item.ageMonths}개월</span><h3>{activity?.title ?? "영어 놀이"}</h3><p>{reactions.find(value => value.id === item.reaction)?.label}{item.note && ` · ${item.note}`}</p></div><button aria-label={`${activity?.title ?? "영어 놀이"} 기록 삭제`} onClick={() => void removeRecord(item.id)}>삭제</button></article>; })}</div> : <div className="empty-record"><span>♡</span><h3>아직 기록이 없어요.</h3><p>오늘 함께 웃은 순간 하나부터 남겨 보세요.</p><button className="primary-button" onClick={() => setView("today")}>오늘의 놀이 보기</button></div>}</section></>}
      {view === "guide" && <><section className="inner-hero"><span className="eyebrow">A GUIDE FOR PARENTS</span><h1>부모가 보고,<br /><em>아이는 화면 밖에서 놀아요.</em></h1><p>짧게 준비하고, 함께 움직이고, 부담 없이 마무리하는 방식입니다.</p></section><section className="family-section"><div className="guide-steps"><article><span>01 · 준비</span><h2>카드 한 장, 20초</h2><p>실제 생활의 한 장면을 골라 영어 한마디만 읽어요. 준비물은 집에 있는 물건이면 충분해요.</p></article><article><span>02 · 함께</span><h2>화면을 내려놓고</h2><p>부모가 먼저 말하고 몸짓을 보여줘요. 아이가 관심을 보이는 대상과 속도를 따라가요.</p></article><article><span>03 · 마무리</span><h2>기억할 순간만 기록</h2><p>좋아했는지, 바라봤는지, 다음에 다시 해볼지만 남겨요. 말하기와 정답을 요구하지 않아요.</p></article></div><div className="guide-note"><h2>우리 가족의 원칙</h2><ul><li>한 번에 3~5분이면 충분해요. 아이가 싫어하면 바로 멈춰요.</li><li>영어를 따라 말하지 않아도 괜찮아요. 한국어로 자연스럽게 이어가세요.</li><li>큰 장난감과 안전한 장소를 사용하고, 산책 중에는 교통 안전을 먼저 챙겨요.</li><li>월령은 시험 기준이 아닌 놀이 제안입니다. 36개월에는 좋아한 놀이를 다시 골라요.</li></ul></div></section></>}
    </main>
    <footer className="family-footer"><span>mora little english</span><p>아이와 함께한 작은 순간을 오래 기억하는 공간</p><Link href="/library">기존 영어 콘텐츠 보기 ↗</Link></footer>
    {selected && <div className="activity-overlay" role="presentation" onClick={() => setSelected(null)}><section className="activity-dialog" role="dialog" aria-modal="true" aria-label={`${selected.title} 놀이 가이드`} onClick={event => event.stopPropagation()}><button className="close-dialog" aria-label="닫기" onClick={() => setSelected(null)}>×</button><div className="dialog-icon">{selected.icon}</div><span className="eyebrow">{selected.months === "prep" ? "16–17개월 준비" : `${selected.months}개월 단계`} · {selected.theme}</span><h2>{selected.title}</h2><div className="phrase-box"><span>오늘의 한마디</span><strong>{selected.phrase}</strong><p>{selected.meaning}</p></div><div className="dialog-guide"><h3>이렇게 해보세요</h3><p>{selected.steps}</p><h3>부모님께</h3><p>{selected.parentTip}</p></div>{viewer ? <div className="record-form"><h3>놀이 뒤에만 기록해요</h3><div className="reaction-options">{reactions.map(item => <button key={item.id} className={reaction === item.id ? "selected" : ""} onClick={() => setReaction(item.id)}>{item.icon} {item.label}</button>)}</div><textarea aria-label="한 줄 메모" maxLength={300} placeholder="아이의 관심이나 즐거웠던 순간을 한 줄로 (선택)" value={note} onChange={event => setNote(event.target.value)} /><button className="primary-button" disabled={busy} onClick={() => void saveRecord()}>{busy ? "저장 중…" : "놀이 기록 저장"}</button></div> : <Link className="primary-button" href="/login?callbackUrl=/">로그인하고 기록하기</Link>}</section></div>}
  </div>;
}

