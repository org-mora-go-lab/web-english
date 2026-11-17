"use client";

import { ChevronDown, ChevronRight, Folder, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

import type { ConversationSidebarProps } from "../type";

export function ConversationSidebar({ signedIn, projects, conversations, activeConversationId, openingConversationId, newChatDisabled = false, busy, loading, error, onNewChat, onOpenConversation, onDeleteConversation, onMoveConversation, onCreateProject, onRenameProject, onDeleteProject }: ConversationSidebarProps) {
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const locked = !signedIn || busy || loading || saving;
  const ungrouped = conversations.filter(item => !item.projectId || !projects.some(project => project.id === item.projectId));

  function cancelName() { setCreating(false); setEditingId(""); setName(""); }
  async function saveName() {
    const value = name.trim();
    if (!value || locked) return;
    setSaving(true);
    try {
      if (editingId ? await onRenameProject(editingId, value) : await onCreateProject(value)) cancelName();
    } finally { setSaving(false); }
  }
  function toggleProject(id: string) {
    setCollapsed(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }
  const nameForm = <form className="conversation-sidebar-name-form" onSubmit={event => { event.preventDefault(); void saveName(); }}>
    <label className="conversation-sidebar-name-label">프로젝트 이름<input aria-label="프로젝트 이름" autoFocus maxLength={60} required disabled={locked} value={name} onChange={event => setName(event.target.value)} placeholder="예: 아침 영어 놀이" /></label>
    <div><button type="submit" disabled={locked || !name.trim()}>{saving ? "저장 중…" : editingId ? "프로젝트 이름 저장" : "프로젝트 만들기"}</button><button type="button" disabled={saving} onClick={cancelName}>취소</button></div>
  </form>;
  function renderConversations(items: typeof conversations) {
    return items.map(item => <div className={`conversation-sidebar-row ${activeConversationId === item.id ? "is-active" : ""}`} key={item.id}>
      <button className={`conversation-sidebar-open${openingConversationId === item.id ? " is-loading" : ""}`} type="button" aria-current={activeConversationId === item.id ? "page" : undefined} aria-busy={openingConversationId === item.id} disabled={locked} onClick={() => onOpenConversation(item.id)} title={item.title}><span>{item.title}</span></button>
      <details className="conversation-sidebar-menu">
        <summary aria-label={`${item.title} 대화 메뉴`}><MoreHorizontal size={16} aria-hidden="true" /></summary>
        <div className="conversation-sidebar-menu-content">
          <label>프로젝트 이동<select aria-label={`${item.title} 프로젝트 이동`} value={item.projectId ?? ""} disabled={locked} onChange={event => { onMoveConversation(item.id, event.target.value || null); event.currentTarget.blur(); const menu = event.currentTarget.closest("details"); if (menu) { menu.open = false; menu.querySelector("summary")?.focus(); } }}><option value="">미분류</option>{projects.map(project => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
          <button className="conversation-sidebar-danger" type="button" aria-label={`${item.title} 대화 삭제`} disabled={locked} onClick={event => { const menu = event.currentTarget.closest("details"); if (menu) menu.open = false; onDeleteConversation(item.id); }}><Trash2 size={13} aria-hidden="true" />대화 삭제</button>
        </div>
      </details>
    </div>);
  }
  return <div className="conversation-sidebar">
    <button className="conversation-sidebar-new" type="button" disabled={!signedIn || loading || newChatDisabled} onClick={onNewChat}><Plus size={16} aria-hidden="true" />새 채팅</button>
    <section className="conversation-sidebar-projects" aria-label="대화 프로젝트">
      <div className="conversation-sidebar-heading"><span>프로젝트</span><button type="button" aria-label="새 프로젝트" disabled={locked} onClick={() => { setCreating(true); setEditingId(""); setName(""); }}><Plus size={15} aria-hidden="true" /></button></div>
      {creating && nameForm}
      {projects.map(project => <section className="conversation-sidebar-project" key={project.id} aria-label={`${project.name} 프로젝트`}>
        <div className="conversation-sidebar-project-heading">
          <button className="conversation-sidebar-project-toggle" type="button" aria-expanded={!collapsed.has(project.id)} disabled={!signedIn || loading} onClick={() => toggleProject(project.id)}>{collapsed.has(project.id) ? <ChevronRight size={13} aria-hidden="true" /> : <ChevronDown size={13} aria-hidden="true" />}<Folder size={14} aria-hidden="true" /><span>{project.name}</span></button>
          <button type="button" aria-label={`${project.name} 프로젝트 이름 변경`} disabled={locked} onClick={() => { setCreating(false); setEditingId(project.id); setName(project.name); }}><Pencil size={12} aria-hidden="true" /></button>
          <button type="button" aria-label={`${project.name} 프로젝트 삭제`} disabled={locked} onClick={() => onDeleteProject(project.id)}><X size={14} aria-hidden="true" /></button>
        </div>
        {editingId === project.id && nameForm}
        {!collapsed.has(project.id) && <div className="conversation-sidebar-project-chats">{conversations.some(item => item.projectId === project.id) ? renderConversations(conversations.filter(item => item.projectId === project.id)) : <p className="conversation-sidebar-empty">대화 메뉴에서 이 프로젝트로 옮겨 보세요.</p>}</div>}
      </section>)}
      {!projects.length && !creating && signedIn && !loading && <p className="conversation-sidebar-empty">놀이 주제별로 대화를 묶어 보세요.</p>}
    </section>
    <section className="conversation-sidebar-chats" aria-label="저장된 채팅"><div className="conversation-sidebar-heading"><span>내 채팅</span></div>{loading ? <p className="conversation-sidebar-empty" role="status">불러오는 중…</p> : ungrouped.length ? renderConversations(ungrouped) : <p className="conversation-sidebar-empty">{signedIn ? "새로운 영어 이야기를 시작해요." : "로그인하면 채팅을 저장할 수 있어요."}</p>}</section>
    {error && <p className="conversation-sidebar-error" role="alert">{error}</p>}
  </div>;
}
