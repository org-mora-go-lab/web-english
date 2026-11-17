"use client";

import { BookOpen, Menu, PanelLeftClose, X } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";

import { AiChat, LoginInvitation, PlayChatCard } from "@/src/3-feature";
import { AccountIdentity } from "@/src/4-entity/account/client";
import type { PlayActivity } from "@/src/4-entity/family";
import { activitiesForAge, activityById, ageMonths, supportedAge } from "@/src/4-entity/family";
import { useViewportHeight } from "@/src/5-shared";

import { ActivityCard } from "./component";
import type { FamilyHubProps } from "./type";

type RecordItem = { id: string; activityId: string; ageMonths: number; reaction: "enjoyed" | "noticed" | "retry"; note: string; playedAt: number };
const reactions = [{ id: "enjoyed", label: "즐거워했어요", icon: "♡" }, { id: "noticed", label: "관심 보였어요", icon: "✦" }, { id: "retry", label: "다음에 다시", icon: "↺" }] as const;

export function FamilyHub({ viewer }: FamilyHubProps) {
  const viewportHeight = useViewportHeight();
  const [contentOpen, setContentOpen] = useState(false);
  const [chatTitle, setChatTitle] = useState("새 채팅");
  const [topic, setTopic] = useState<{ key: string; title: string; prompt: string; activityId: string } | null>(null);
  const [sidebar, setSidebar] = useState(false);
  const [desktopSidebarHidden, setDesktopSidebarHidden] = useState(false);
  const [chatSidebar, setChatSidebar] = useState<HTMLElement | null>(null);
  const panel = useRef<HTMLDialogElement | null>(null);
  const contentRef = useRef<HTMLElement | null>(null);
  const [view, setView] = useState<"plays" | "records">("plays");
  const [age, setAge] = useState(16);
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
    fetch("/api/family", { signal: controller.signal }).then(response => { if (!response.ok) throw new Error(); return response.json(); }).then(data => {
      if (!controller.signal.aborted) { setAge(supportedAge(data.ageMonths)); setRecords(data.records); }
    }).catch(() => { if (!controller.signal.aborted) setMessage("기록을 불러오지 못했습니다. 새로고침해 주세요."); }).finally(() => { if (!controller.signal.aborted) setProfileReady(true); });
    return () => controller.abort();
  }, [viewer]);
  useEffect(() => { if (contentOpen) contentRef.current?.scrollTo({ top: 0 }); }, [contentOpen, view, age, selected]);
  const month = ageMonths.find(item => item.age === age)!;
  const activities = activitiesForAge(age);
  const activeDays = useMemo(() => new Set(records.map(item => new Date(item.playedAt).toDateString())).size, [records]);

  function openContent(nextView: "plays" | "records" = "plays") {
    setSelected(null); setView(nextView); setContentOpen(true); setSidebar(false);
    panel.current?.showModal();
  }
  function closeContent() { panel.current?.close(); setContentOpen(false); }
  async function saveAge(value: number) {
    const previous = age;
    setAge(value); setAgeSaving(true); setMessage("");
    try {
      const response = await fetch("/api/family", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ageMonths: value }) });
      if (!response.ok) throw new Error();
    } catch { setAge(previous); setMessage("개월수 저장에 실패했습니다. 다시 선택해 주세요."); }
    finally { setAgeSaving(false); }
  }
  async function saveRecord() {
    if (!selected || !viewer || busy) return;
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
    if (!viewer || busy) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/family?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setRecords(current => current.filter(item => item.id !== id));
    } catch { setMessage("기록 삭제에 실패했습니다."); }
    finally { setBusy(false); }
  }
  function openActivity(activity: PlayActivity) {
    if (ageSaving || !profileReady) return;
    setSelected(null); closeContent(); setSidebar(false);
    setTopic({ key: crypto.randomUUID(), title: activity.title, activityId: activity.id, prompt: `영어 학습 콘텐츠 “${activity.title}”로 대화를 시작해 주세요. 대상은 ${age}개월 아이의 부모입니다.
이번 개월수의 놀이 방향: ${month.focus}. ${month.cue}
주제: ${activity.theme}, ${activity.scene}
영어 표현: ${activity.phrase} (${activity.meaning})
놀이 방법: ${activity.steps}
부모 가이드: ${activity.parentTip}
이 내용을 바탕으로 부모와 짧은 영어 대화를 연습해 주세요. 먼저 상황에 어울리는 쉬운 한마디와 질문 하나로 시작하고, 제 답변에 맞춰 이어가 주세요. 아이에게 정답이나 따라 말하기를 요구하지 마세요.
[MORA_PLAY:${activity.id}]` });
  }
  function recordActivity(id: string) {
    const activity = activityById(id); if (!activity) return;
    setSelected(activity); setReaction("enjoyed"); setNote(""); setMessage(""); setContentOpen(true);
    panel.current?.showModal();
  }
  const monthOptions = ageMonths.map(item => <option key={item.age} value={item.age}>{item.age}개월</option>);
  if (!viewer) return <LoginInvitation />;
  return <div className={`family-hub${desktopSidebarHidden ? " is-sidebar-hidden" : ""}`} style={{ height: viewportHeight }}>
    {!sidebar && <button className="mobile-menu" aria-label="메뉴 열기" aria-expanded={false} aria-controls="family-sidebar" onClick={() => setSidebar(true)}><Menu size={22} aria-hidden="true" /></button>}
    {sidebar && <button className="sidebar-backdrop" aria-label="메뉴 배경 닫기" onClick={() => setSidebar(false)} />}
    <aside id="family-sidebar" inert={desktopSidebarHidden && !sidebar} className={`family-sidebar ${sidebar ? "is-open" : ""}`} aria-label="채팅 메뉴">
      <div className="family-sidebar-header"><Link href="/" className="family-brand" aria-label="Mora 홈"><span className="brand-mark" aria-hidden="true">m.</span><span>Mora</span></Link><button type="button" className="sidebar-menu" aria-label="메뉴 닫기" onClick={() => { setDesktopSidebarHidden(true); setSidebar(false); }}><PanelLeftClose size={20} aria-hidden="true" /></button></div>
      <div className="family-sidebar-body">
        <p className="sidebar-caption">작은 놀이, 함께하는 영어</p><section className="chat-sidebar-slot" ref={setChatSidebar} aria-label="내 채팅" />
        <div className="sidebar-age"><label htmlFor="child-age">현재 개월수</label><select id="child-age" aria-label="아이 개월수" value={age} disabled={!profileReady || ageSaving} onChange={event => { void saveAge(Number(event.target.value)); event.currentTarget.blur(); }}>{monthOptions}</select><p>{month.focus}</p></div>
        <div className="sidebar-bottom"><p>♡ 함께한 날 {activeDays}일</p><div className="family-account"><Link href="/settings/account"><AccountIdentity displayName={viewer.displayName} profileImageUrl={viewer.profileImageUrl} compact /></Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></div></div>
      </div>
    </aside>
    <div className="family-content">
      <header className="play-header">{desktopSidebarHidden && <button type="button" className="desktop-menu" aria-label="메뉴 열기" aria-expanded={false} onClick={() => setDesktopSidebarHidden(false)}><Menu size={22} aria-hidden="true" /></button>}<span className="play-header-title" title={chatTitle}>{chatTitle}</span><button className="play-content-button" aria-label="콘텐츠" title="콘텐츠" aria-haspopup="dialog" aria-expanded={contentOpen} aria-controls="learning-content" onClick={() => openContent()}><BookOpen size={20} aria-hidden="true" /></button></header>
      <div className="chat-dock"><AiChat signedIn embedded learningTopic={topic} onTitleChange={setChatTitle} onClearTopic={() => setTopic(null)} sidebarTarget={chatSidebar} onSidebarNavigate={() => { setSidebar(false); closeContent(); setSelected(null); }} welcomeVisual={<PlayChatCard onStartToday={() => openContent()} disabled={ageSaving || !profileReady} />} renderLearningVisual={id => { const activity = activityById(id); return activity ? <PlayChatCard activity={activity} onRecord={() => recordActivity(id)} /> : null; }} /></div>
    </div>
    <dialog ref={panel} id="learning-content" className="family-panel" aria-labelledby="family-panel-title" onClose={() => setContentOpen(false)} onClick={event => { if (event.target === event.currentTarget) closeContent(); }}>
      <div className="content-heading"><div><span className="eyebrow">A LITTLE ENGLISH, A LITTLE PLAY</span><h2 id="family-panel-title">{selected ? "놀이 기록 남기기" : "영어 학습 콘텐츠"}</h2></div><button type="button" autoFocus aria-label="학습 콘텐츠 닫기" onClick={closeContent}><X size={20} aria-hidden="true" /></button></div>
      {!selected && <div className="content-toolbar"><div className="content-tabs" role="tablist" aria-label="콘텐츠 보기"><button type="button" role="tab" aria-selected={view === "plays"} onClick={() => setView("plays")}>{age}개월 놀이</button><button type="button" role="tab" aria-selected={view === "records"} onClick={() => setView("records")}>놀이 기록</button></div><label>개월수<select aria-label="콘텐츠 개월수" value={age} disabled={!profileReady || ageSaving} onChange={event => { void saveAge(Number(event.target.value)); event.currentTarget.blur(); }}>{monthOptions}</select></label></div>}
      <main ref={contentRef} className="family-main" aria-label="영어 학습 콘텐츠">
        {message && <p role="status" className="family-message">{message}</p>}
        {!profileReady && <p role="status">우리 가족의 콘텐츠를 불러오고 있어요…</p>}
        {selected ? <section className="activity-dialog" aria-label={`${selected.title} 놀이 가이드`}><div className="dialog-icon">{selected.icon}</div><h3>{selected.title}</h3><div className="phrase-box"><strong>{selected.phrase}</strong><p>{selected.meaning}</p></div><div className="dialog-guide"><h3>이렇게 해보세요</h3><p>{selected.steps}</p><h3>부모님께</h3><p>{selected.parentTip}</p></div><form className="record-form" onSubmit={event => { event.preventDefault(); void saveRecord(); }}><h3>놀이 뒤에만 기록해요</h3><div className="reaction-options">{reactions.map(item => <button type="button" key={item.id} className={reaction === item.id ? "selected" : ""} aria-pressed={reaction === item.id} onClick={() => setReaction(item.id)}>{item.icon} {item.label}</button>)}</div><textarea aria-label="한 줄 메모" maxLength={300} placeholder="아이의 관심이나 즐거웠던 순간을 한 줄로 (선택)" value={note} onChange={event => setNote(event.target.value)} /><button className="primary-button" disabled={busy}>{busy ? "저장 중…" : "놀이 기록 저장"}</button></form></section>
        : view === "plays" ? <section className="family-section"><span className="eyebrow">{age}개월 · 함께하는 영어 놀이</span><h3>{month.focus}</h3><p>{month.cue} 놀이를 고르면 지금 채팅에서 이야기를 이어가요.</p><p className="content-parent-note">개월수는 놀이 선택을 위한 참고예요. 따라 말하기나 정답을 요구하지 않고, 아이가 싫어하면 멈춰 주세요.</p><div className="activity-grid">{activities.map(activity => <ActivityCard key={activity.id} activity={activity} onOpen={openActivity} disabled={!profileReady || ageSaving} />)}</div></section>
        : <section className="family-section"><div className="section-heading"><div><span className="eyebrow">PLAY JOURNAL</span><h3>놀이 기록 {records.length}개</h3></div><button className="text-button" onClick={() => setView("plays")}>놀이 고르기 →</button></div>{records.length ? <div className="record-list">{records.map(item => { const activity = activityById(item.activityId); return <article className="record-row" key={item.id}><div className="record-emoji">{activity?.icon ?? "♡"}</div><div><span className="record-date">{new Date(item.playedAt).toLocaleDateString("ko-KR")} · {item.ageMonths}개월</span><h3>{activity?.title ?? "영어 놀이"}</h3><p>{reactions.find(value => value.id === item.reaction)?.label}{item.note && ` · ${item.note}`}</p></div><button disabled={busy} aria-label={`${activity?.title ?? "영어 놀이"} 기록 삭제`} onClick={() => void removeRecord(item.id)}>삭제</button></article>; })}</div> : <div className="empty-record"><h3>아직 기록이 없어요.</h3><p>채팅 속 놀이 카드에서 함께 웃은 순간을 남겨 보세요.</p><button className="primary-button" onClick={() => setView("plays")}>놀이 고르기</button></div>}</section>}
      </main>
    </dialog>
  </div>;
}
