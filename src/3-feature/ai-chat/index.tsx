"use client";

import { ArrowDown, ArrowUp, ChevronDown, Menu, MessageCircle, Mic, Plus, RefreshCw, Sparkles, Square, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { activityFromChatText } from "@/src/4-entity/family";
import { ThemePicker } from "@/src/5-shared";

import { ConversationSidebar } from "./component";
import { useAiVoice } from "./hook";
import type { AiChatProps, ChatConfiguration, ChatMessage, ChatMode, ChatProject, ConversationSummary, SavedConversation } from "./type";

const modelStorageKey = "mora-english-ai-model";
const maxMessages = 200;
const maxCharacters = 2000;
const starterPrompts = {
  parent: [
    { label: "공놀이할 때 한마디", prompt: "두 살 아이와 공을 굴리며 놀 때 쓸 쉬운 영어 3개와 짧은 놀이 방법을 알려 주세요." },
    { label: "씻는 시간도 즐겁게", prompt: "두 살 아이가 손을 씻을 때 부모가 말할 짧고 즐거운 영어 표현을 알려 주세요." },
    { label: "좋아하는 동물로 놀이", prompt: "토끼를 좋아하는 두 살 아이와 할 수 있는 3분짜리 영어 놀이를 알려 주세요. 집에 있는 물건을 사용하고 싶어요." },
  ],
  practice: [
    { label: "영어로 가볍게 인사", prompt: "Let's practice a simple greeting. Please ask me one easy question at a time and gently help me with my English." },
    { label: "오늘 하루 이야기", prompt: "I'd like to talk about my day in simple English. Please start with one easy question." },
    { label: "아이에게 하는 말 연습", prompt: "Help me practice short English phrases I can say while playing with my toddler. Let's take turns." },
  ],
};

export function AiChat({ signedIn, embedded = false, learningTopic, onClearTopic, sidebarTarget, onSidebarNavigate, welcomeVisual, renderLearningVisual, onContentTarget }: AiChatProps) {
  const [configuration, setConfiguration] = useState<ChatConfiguration | null>(null);
  const [configurationLoading, setConfigurationLoading] = useState(signedIn);
  const [configurationError, setConfigurationError] = useState(false);
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<ChatMode>("parent");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [loginRequired, setLoginRequired] = useState(!signedIn);
  const request = useRef<AbortController | null>(null);
  const configurationRequest = useRef<AbortController | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  const conversationEnd = useRef<HTMLDivElement | null>(null);
  const [conversationId, setConversationId] = useState("");
  const [revision, setRevision] = useState(0);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [historyLoading, setHistoryLoading] = useState(signedIn);
  const [projects, setProjects] = useState<ChatProject[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(signedIn);
  const [managementError, setManagementError] = useState("");
  const [managementBusy, setManagementBusy] = useState(false);
  const projectsRequest = useRef<AbortController | null>(null);
  const [historyError, setHistoryError] = useState("");
  const historyRequest = useRef<AbortController | null>(null);
  const turn = useRef<{ key: string; id: string } | null>(null);
  const [voiceName, setVoiceName] = useState<"cat" | "marin" | "cedar">("marin");
  const voice = useAiVoice({ conversationId, revision, mode, voice: voiceName,
    onTranscript: setPendingQuestion,
    onConversation: item => { applyConversation(item); setConversations(items => [item, ...items.filter(row => row.id !== item.id)].slice(0, 100)); setPendingQuestion(""); },
    onError: message => { setPendingQuestion(""); setError(message); },
    onNotice: message => { setPendingQuestion(""); setNotice(message); },
  });

  function applyConversation(item: SavedConversation) {
    setConversationId(item.id); setRevision(item.revision); setMessages(item.messages); setMode(item.mode);
    if (["gpt-6-luna", "gpt-6-sol", "gpt-6-astra"].includes(item.model)) setModel(item.model);
    turn.current = null;
  }

  const loadHistory = useCallback(async () => {
    historyRequest.current?.abort();
    const controller = new AbortController(); historyRequest.current = controller;
    try {
      const response = await fetch("/api/ai/conversations", { cache: "no-store", signal: controller.signal });
      if (response.status === 401) { setLoginRequired(true); return; }
      if (!response.ok) throw new Error("대화 내역을 불러오지 못했어요. 다시 불러온 뒤 시작해 주세요.");
      const data = await response.json();
      if (controller.signal.aborted) return;
      setConversations(data.conversations);
      if (data.latest) applyConversation(data.latest);
      else { setConversationId(""); setRevision(0); setMessages([]); turn.current = null; }
      setHistoryError("");
    } catch (failure) { if (!controller.signal.aborted) setHistoryError(failure instanceof Error ? failure.message : "대화 내역을 불러오지 못했어요."); }
    finally { if (!controller.signal.aborted) setHistoryLoading(false); }
  }, []);

  function reloadHistory() { onClearTopic?.(); voice.stop(); setHistoryLoading(true); setDraft(""); setError(""); void loadHistory(); }

  async function openConversation(id: string) {
    voice.stop(); setHistoryLoading(true); setError("");
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, { cache: "no-store" });
      if (response.status === 401) setLoginRequired(true);
      if (!response.ok) throw new Error("대화를 불러오지 못했어요. 내역을 다시 불러와 주세요.");
      applyConversation((await response.json()).conversation); onClearTopic?.(); setDraft(""); setHistoryError("");
    } catch (failure) { setHistoryError(failure instanceof Error ? failure.message : "대화를 불러오지 못했어요."); }
    finally { setHistoryLoading(false); }
  }

  async function deleteConversation(id = conversationId) {
    if (!signedIn || loginRequired || !id || !window.confirm("이 대화 내역을 삭제할까요? 삭제한 대화는 복구할 수 없어요.")) return;
    if (id === conversationId) voice.stop();
    setManagementBusy(true); setManagementError("");
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, { method: "DELETE" });
      if (response.status === 401) setLoginRequired(true);
      if (!response.ok) throw new Error("대화를 삭제하지 못했어요. 다시 시도해 주세요.");
      setConversations(items => items.filter(item => item.id !== id));
      if (id === conversationId) startFresh();
    } catch (failure) { setManagementError(failure instanceof Error ? failure.message : "대화를 삭제하지 못했어요."); }
    finally { setManagementBusy(false); }
  }

  const loadProjects = useCallback(async () => {
    projectsRequest.current?.abort();
    const controller = new AbortController(); projectsRequest.current = controller;
    try {
      const response = await fetch("/api/ai/projects", {cache: "no-store", signal: controller.signal});
      if (response.status === 401) { setLoginRequired(true); return; }
      if (!response.ok) throw new Error("프로젝트를 불러오지 못했어요. 새로고침해 주세요.");
      const data = await response.json();
      if (!controller.signal.aborted) { setProjects(data.projects); setManagementError(""); }
    } catch (failure) { if (!controller.signal.aborted) setManagementError(failure instanceof Error ? failure.message : "프로젝트를 불러오지 못했어요."); }
    finally { if (!controller.signal.aborted) setProjectsLoading(false); }
  }, []);

  async function updateProject(id: string | null, name: string) {
    if (!signedIn || loginRequired || managementBusy) return false;
    setManagementBusy(true); setManagementError("");
    try {
      const response = await fetch(id ? `/api/ai/projects/${id}` : "/api/ai/projects", {method: id ? "PATCH" : "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({name})});
      const data = await response.json();
      if (response.status === 401) setLoginRequired(true);
      if (!response.ok) throw new Error(data.error ?? "프로젝트를 저장하지 못했어요.");
      setProjects(items => id ? items.map(item => item.id === id ? data.project : item) : [...items, data.project]);
      return true;
    } catch (failure) { setManagementError(failure instanceof Error ? failure.message : "프로젝트를 저장하지 못했어요."); return false; }
    finally { setManagementBusy(false); }
  }

  async function deleteProject(id: string) {
    if (!signedIn || loginRequired || managementBusy || !window.confirm("프로젝트를 삭제할까요? 포함된 대화는 삭제하지 않고 내 채팅으로 옮겨요.")) return;
    setManagementBusy(true); setManagementError("");
    try {
      const response = await fetch(`/api/ai/projects/${id}`, {method: "DELETE"});
      if (response.status === 401) setLoginRequired(true);
      if (!response.ok) throw new Error("프로젝트를 삭제하지 못했어요.");
      setProjects(items => items.filter(item => item.id !== id));
      setConversations(items => items.map(item => item.projectId === id ? {...item, projectId: null} : item));
    } catch (failure) { setManagementError(failure instanceof Error ? failure.message : "프로젝트를 삭제하지 못했어요."); }
    finally { setManagementBusy(false); }
  }

  async function moveConversation(id: string, projectId: string | null) {
    if (!signedIn || loginRequired || managementBusy) return;
    setManagementBusy(true); setManagementError("");
    try {
      const response = await fetch(`/api/ai/conversations/${id}`, {method: "PATCH", headers: {"Content-Type": "application/json"}, body: JSON.stringify({projectId})});
      const data = await response.json();
      if (response.status === 401) setLoginRequired(true);
      if (!response.ok) throw new Error(data.error ?? "대화를 이동하지 못했어요.");
      setConversations(items => items.map(item => item.id === id ? {...item, projectId: data.conversation.projectId} : item));
    } catch (failure) { setManagementError(failure instanceof Error ? failure.message : "대화를 이동하지 못했어요."); }
    finally { setManagementBusy(false); }
  }

  const loadConfiguration = useCallback(async () => {
    configurationRequest.current?.abort();
    const controller = new AbortController();
    configurationRequest.current = controller;
    try {
      const response = await fetch("/api/ai/models", { signal: controller.signal, cache: "no-store" });
      if (response.status === 401) { setLoginRequired(true); return; }
      if (!response.ok) throw new Error("configuration");
      const data = await response.json() as ChatConfiguration;
      if (!Array.isArray(data.models) || typeof data.configured !== "boolean") throw new Error("configuration");
      if (controller.signal.aborted) return;
      let remembered = "";
      try { remembered = localStorage.getItem(modelStorageKey) ?? ""; } catch { /* The current selection still works without browser storage. */ }
      const fallback = data.models.some(item => item.id === data.defaultModel) ? data.defaultModel : data.models[0]?.id ?? "";
      setModel(current => data.models.some(item => item.id === current) ? current : data.models.some(item => item.id === remembered) ? remembered : fallback);
      setConfiguration(data);
    } catch {
      if (!controller.signal.aborted) setConfigurationError(true);
    } finally {
      if (!controller.signal.aborted) setConfigurationLoading(false);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    queueMicrotask(() => { if (!disposed && signedIn) { void loadConfiguration(); void loadHistory(); void loadProjects(); } });
    return () => { disposed = true; configurationRequest.current?.abort(); historyRequest.current?.abort(); projectsRequest.current?.abort(); request.current?.abort(); };
  }, [loadConfiguration, loadHistory, loadProjects, signedIn]);

  useEffect(() => {
    if (messages.length || pendingQuestion) conversationEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, pendingQuestion]);

  const activeModel = configuration?.models.find(item => item.id === model);
  const suggestedMessage = mode === "parent" ? "공놀이할 때 아이에게 무슨 영어를 해주면 좋을까요?" : "I'd like to practice talking about my day.";
  const conversationFull = messages.length >= maxMessages;
  const context = messages.slice(-18);
  while (context.length && context.reduce((total, item) => total + item.content.length, 0) > 10000) context.splice(0, 2);
  const outgoingMessage = draft.trim() || suggestedMessage;
  const contextTooLong = context.reduce((total, item) => total + item.content.length, 0) + outgoingMessage.length > 12000;
  const authenticated = signedIn && !loginRequired;
  const canCompose = authenticated && !managementBusy && !voice.active && Boolean(configuration?.configured && activeModel) && !configurationLoading && !configurationError && !historyLoading && !historyError;
  const canSend = canCompose && !busy && !conversationFull && !contextTooLong && Boolean(outgoingMessage) && outgoingMessage.length <= maxCharacters;

  function retryConfiguration() {
    setConfigurationLoading(true);
    setConfigurationError(false);
    void loadConfiguration();
  }

  function selectModel(value: string) {
    setModel(value);
    try { localStorage.setItem(modelStorageKey, value); }
    catch { setNotice("브라우저 저장 공간을 사용할 수 없어 모델 선택은 이번 방문에만 유지돼요."); }
  }

  function startFresh(nextMode = mode) {
    request.current?.abort(); request.current = null; setBusy(false);
    onClearTopic?.();
    voice.stop(); setConversationId(""); setRevision(0); turn.current = null;
    setMode(nextMode);
    setMessages([]);
    setDraft("");
    setError("");
    setPendingQuestion("");
    setNotice(nextMode === mode ? "새 대화를 시작했어요." : "대화 모드를 바꿨어요. 새 대화를 시작해 주세요.");
    composer.current?.focus();
  }

  function stopResponse() {
    voice.stop();
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setPendingQuestion("");
    setError("");
    setNotice("응답 생성을 중지했어요. 작성한 질문은 남아 있어요.");
  }

  async function sendMessage(spoken?: string) {
    const content = spoken === undefined ? outgoingMessage : spoken.trim();
    if (!canCompose || busy || conversationFull || !content || content.length > maxCharacters || request.current) { if (spoken) voice.stop(); return; }
    const chosenModel = model;
    const history = context.map(item => ({ role: item.role, content: item.content }));
    const id = conversationId || crypto.randomUUID(); setConversationId(id);
    const key = JSON.stringify([id, revision, chosenModel, mode, content]);
    if (turn.current?.key !== key) turn.current = { key, id: crypto.randomUUID() };
    const controller = new AbortController();
    request.current = controller;
    setOptionsOpen(false);
    if (!draft.trim()) setDraft(content);
    setBusy(true);
    setError("");
    setNotice("");
    setPendingQuestion(content);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: id, revision, turnId: turn.current.id, model: chosenModel, mode, messages: [...history, { role: "user", content }] }),
        signal: controller.signal,
      });
      const data = await response.json().catch(() => { throw new Error("답변을 가져오지 못했어요. 잠시 뒤 다시 보내 주세요."); });
      if (controller.signal.aborted) return;
      if (!response.ok) {
        if (response.status === 401) setLoginRequired(true);
        throw new Error(typeof data.error === "string" ? data.error : "답변을 가져오지 못했어요. 잠시 뒤 다시 보내 주세요.");
      }
      if (typeof data.reply !== "string" || !data.reply.trim()) throw new Error("답변을 가져오지 못했어요. 잠시 뒤 다시 보내 주세요.");
      const responseModel = configuration?.models.find(item => item.id === data.model)?.id ?? chosenModel;
      setMessages(current => [...current, { id: crypto.randomUUID(), role: "user", content }, { id: crypto.randomUUID(), role: "assistant", content: data.reply, model: responseModel }]);
      if (data.conversation) {
        applyConversation(data.conversation);
        setConversations(items => [data.conversation, ...items.filter(item => item.id !== data.conversation.id)].slice(0, 100));
      }
      setDraft("");
    } catch (failure) {
      voice.stop();
      if (!controller.signal.aborted) setError(failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "연결이 잠시 끊겼어요. 작성한 질문은 남아 있으니 다시 보내 주세요.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
        setPendingQuestion("");
      }
    }
  }

  const handledTopic = useRef("");
  const beginTopic = useEffectEvent((topic: NonNullable<AiChatProps["learningTopic"]>) => {
    setDraft(topic.prompt);
    void sendMessage(topic.prompt);
    composer.current?.focus();
  });
  useEffect(() => {
    if (!learningTopic || handledTopic.current === learningTopic.key || !canCompose || busy || conversationFull) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || handledTopic.current === learningTopic.key) return;
      handledTopic.current = learningTopic.key;
      beginTopic(learningTopic);
    });
    return () => { cancelled = true; };
  }, [learningTopic, canCompose, busy, conversationFull]);

  const modelControl = (<div className="ai-chat-select"><select id="ai-model" aria-label="AI 모델" value={model} disabled={!authenticated || busy || voice.active || configurationLoading || configurationError || !configuration?.models.length} onChange={event => selectModel(event.target.value)}>{configuration?.models.length ? configuration.models.map(item => <option value={item.id} key={item.id}>{item.name}</option>) : <option value="">{configurationLoading ? "모델 불러오는 중…" : configurationError ? "모델을 불러오지 못했어요" : "모델 준비 중"}</option>}</select><ChevronDown size={15} aria-hidden="true" /></div>);
  const voiceControl = (<select id="ai-voice-name" aria-label="목소리" value={voiceName} disabled={!authenticated || voice.active} onChange={event => setVoiceName(event.target.value as "cat" | "marin" | "cedar")}><option value="cat">고양이 · 귀엽고 다정하게</option><option value="marin">여자 · Marin</option><option value="cedar">남자 · Cedar</option></select>);
  const chatSettings = (<>      <div className="ai-chat-settings"><h2>대화 설정</h2><ThemePicker /><button type="button" disabled={!voice.active} aria-pressed={voice.muted} onClick={voice.toggleMute}>{voice.muted ? "마이크 켜기" : "마이크 끄기"}</button>
      <div className="ai-chat-toolbar">
        <div className="ai-chat-modes" role="group" aria-label="대화 모드">
          <button type="button" aria-pressed={mode === "parent"} disabled={!authenticated || managementBusy || busy || historyLoading || voice.active} onClick={() => mode !== "parent" && startFresh("parent")}><Sparkles size={16} aria-hidden="true" />부모 영어 놀이</button>
          <button type="button" aria-pressed={mode === "practice"} disabled={!authenticated || managementBusy || busy || historyLoading || voice.active} onClick={() => mode !== "practice" && startFresh("practice")}><MessageCircle size={16} aria-hidden="true" />영어 회화 연습</button>
        </div>
        {!sidebarTarget && <button type="button" className="ai-chat-new" disabled={managementBusy || busy || historyLoading || voice.active || (!messages.length && !draft)} onClick={() => startFresh()}><Plus size={16} aria-hidden="true" />새 대화</button>}
      </div>

      {!sidebarTarget && <div className="ai-chat-history">
        <label htmlFor="ai-history">내 대화 내역</label>
        <select id="ai-history" value={conversations.some(item => item.id === conversationId) ? conversationId : ""} disabled={!authenticated || managementBusy || busy || historyLoading || voice.active} onChange={event => { if (event.target.value) void openConversation(event.target.value); else startFresh(); }}>
          <option value="">새 대화</option>{conversations.map(item => <option value={item.id} key={item.id}>{item.title}</option>)}
        </select>
        <button type="button" disabled={!authenticated || managementBusy || busy || historyLoading || voice.active} onClick={reloadHistory}><RefreshCw size={14} aria-hidden="true" />내역 새로고침</button>
        <button type="button" disabled={managementBusy || busy || historyLoading || voice.active || !conversations.some(item => item.id === conversationId)} onClick={() => void deleteConversation()}><Trash2 size={14} aria-hidden="true" />대화 삭제</button>
      </div>
      }
      {historyLoading && <p className="ai-chat-notice" role="status">저장된 대화를 불러오고 있어요…</p>}
      {historyError && <p className="ai-chat-banner ai-chat-error" role="alert">{historyError}</p>}

      </div>      <details className="ai-chat-policy"><summary>정책</summary><p>고급 음성은 AI가 생성합니다. 마이크 음성과 대화는 OpenAI로 전송되며 API 사용료가 적용됩니다. 부모님이 함께 사용해 주세요.</p><p id="ai-chat-memory">빈 입력창에서 Tab을 누르면 추천 질문을 채워요. 완료된 대화는 로그인한 계정에 저장되며 다시 접속하면 이어갈 수 있어요. 최근 대화부터 AI에 전달해요.</p><p id="ai-chat-privacy">입력한 대화는 답변 생성을 위해 OpenAI로 전송됩니다. 아이의 이름 등 개인정보는 입력하지 마세요.</p></details></>);

  return (
    <section className={`ai-chat${embedded ? " is-embedded" : ""}`} id="ai-chat" aria-label="AI 영어 도우미">
      {sidebarTarget && createPortal(<ConversationSidebar signedIn={authenticated} projects={projects} conversations={conversations} activeConversationId={conversationId} newChatDisabled={managementBusy} busy={busy || voice.active || managementBusy} loading={authenticated && (historyLoading || projectsLoading)} error={managementError} onNewChat={() => { if (authenticated) { startFresh(); onSidebarNavigate?.(); } }} onOpenConversation={id => { if (authenticated) { void openConversation(id); onSidebarNavigate?.(); } }} onDeleteConversation={id => void deleteConversation(id)} onMoveConversation={(id, projectId) => void moveConversation(id, projectId)} onCreateProject={name => updateProject(null, name)} onRenameProject={updateProject} onDeleteProject={id => void deleteProject(id)} />, sidebarTarget)}
      {sidebarTarget ? createPortal(chatSettings, sidebarTarget) : <><button className="ai-chat-sidebar-toggle" type="button" aria-label={optionsOpen ? "메뉴 닫기" : "메뉴 열기"} aria-expanded={optionsOpen} onClick={() => setOptionsOpen(open => !open)}><Menu size={22} aria-hidden="true" /></button>{optionsOpen && <button type="button" className="ai-chat-sidebar-backdrop" aria-label="메뉴 배경 닫기" onClick={() => setOptionsOpen(false)} />}<aside className={`ai-chat-standalone-sidebar${optionsOpen ? " is-open" : ""}`} aria-label="대화 설정 및 내역">{chatSettings}</aside></>}


      {configurationError && <div className="ai-chat-banner ai-chat-error" role="alert"><p>모델 정보를 불러오지 못했어요. 연결 상태를 다시 확인해 주세요.</p><button type="button" onClick={retryConfiguration}><RefreshCw size={14} aria-hidden="true" />연결 상태 다시 확인</button></div>}
      {!configurationError && !configurationLoading && configuration && !configuration.configured && <div className="ai-chat-banner" role="status"><p><strong>AI 연결을 준비하고 있어요.</strong><br />연결이 완료되면 선택한 모델과 대화할 수 있어요.</p><button type="button" onClick={retryConfiguration}><RefreshCw size={14} aria-hidden="true" />연결 상태 다시 확인</button></div>}

      <div className="ai-chat-log-area">
      <div className="ai-chat-conversation" role="log" aria-label="AI 대화" aria-live="polite" aria-busy={busy}>
        {learningTopic && <div className="ai-chat-topic" role="status"><span>학습 주제</span><strong>{learningTopic.title}</strong>{voice.active && !messages.some(item => item.content === learningTopic.prompt) && <small>음성을 종료하면 선택한 주제로 대화를 시작해요.</small>}{!signedIn && <small>로그인한 뒤 콘텐츠를 다시 선택해 대화를 시작해 주세요.</small>}</div>}
        {learningTopic?.activityId && !messages.some(item => item.role === "user" && activityFromChatText(item.content)?.id === learningTopic.activityId) && pendingQuestion !== learningTopic.prompt && renderLearningVisual?.(learningTopic.activityId)}
        {!messages.length && !pendingQuestion && !learningTopic && welcomeVisual}
        {!messages.length && !pendingQuestion && !learningTopic && !welcomeVisual && <div className="ai-chat-welcome">
          <div className="ai-chat-welcome-mark" aria-hidden="true"><Sparkles size={25} strokeWidth={1.5} /></div>
          <span className="ai-chat-welcome-eyebrow">{mode === "parent" ? "LET'S MAKE PLAYTIME SIMPLE" : "A SMALL CONVERSATION, EVERY DAY"}</span>
          <h2>{mode === "parent" ? (embedded ? "우리 가족만의 영어 시간을 시작해요." : "오늘, 어떤 놀이를 준비할까요?") : "틀려도 괜찮아요. 한마디부터."}</h2>
          <p>{mode === "parent" ? "익숙한 하루의 장면을 알려 주세요.\n아이와 함께할 쉬운 영어와 놀이를 생각해 드릴게요." : "부모님을 위한 편안한 영어 연습이에요.\n짧은 인사나 오늘 있었던 일부터 이야기해 보세요."}</p>
          <div className="ai-chat-starters">{starterPrompts[mode].map(item => <button type="button" key={item.label} disabled={!canCompose} onClick={() => { setDraft(item.prompt); setError(""); composer.current?.focus(); }}><span>{item.label}</span><ArrowDown size={14} aria-hidden="true" /></button>)}</div>
        </div>}
        {messages.map(item => {
          const activity = item.role === "user" ? activityFromChatText(item.content) : undefined;
          return <div key={item.id} className="ai-chat-turn">{activity && renderLearningVisual?.(activity.id)}<article className={`ai-chat-message is-${item.role}`} data-testid={`ai-message-${item.role}`}><div className="ai-chat-message-label">{item.role === "user" ? "나" : <><Sparkles size={14} aria-hidden="true" />영어 도우미<span>{configuration?.models.find(value => value.id === item.model)?.name ?? (item.model === "gpt-realtime-2.1" ? "GPT Realtime 2.1" : item.model)}</span></>}</div><p>{activity ? `“${activity.title}” 놀이로 이야기해요.` : item.content}</p></article></div>;
        })}
        {pendingQuestion && <>{(() => { const activity = activityFromChatText(pendingQuestion); return <>{activity && renderLearningVisual?.(activity.id)}<article className="ai-chat-message is-user is-pending" data-testid="ai-message-pending"><div className="ai-chat-message-label">나</div><p>{activity ? `“${activity.title}” 놀이로 이야기해요.` : pendingQuestion}</p></article></>; })()}<div className="ai-chat-thinking" role="status"><span aria-hidden="true">✦</span>{voice.active ? "고급 음성 코치" : activeModel?.name}가 답변을 준비하고 있어요…</div></>}
        <div ref={conversationEnd} />
      </div>
      <div className="ai-chat-content-target" ref={onContentTarget} />
      </div>

      {!authenticated && <div className="ai-chat-login-card"><div><strong>{signedIn ? "다시 로그인해 주세요." : "부모님, 로그인하고 시작해 보세요."}</strong><p>{signedIn ? "로그인 시간이 만료됐어요. 다시 로그인한 뒤 대화할 수 있어요." : "모델을 고르고 우리 가족에게 맞는 영어를 준비할 수 있어요."}</p></div><Link href={embedded ? "/login?callbackUrl=/" : "/login?callbackUrl=/ai"}>로그인하고 대화하기<ArrowUp size={15} aria-hidden="true" /></Link></div>}

      {error && <div className="ai-chat-banner ai-chat-error" role="alert"><p>{error}</p>{!loginRequired && <button type="button" disabled={!canSend} onClick={() => void sendMessage()}><RefreshCw size={14} aria-hidden="true" />다시 보내기</button>}</div>}
      {notice && <p className="ai-chat-notice" role="status">{notice}</p>}
      {conversationFull && !voice.active && <div className="ai-chat-banner" role="status"><p>텍스트 대화는 100회까지 가능해요. 음성으로 계속 이야기하거나 새 대화로 이어가 주세요.</p></div>}
      {!conversationFull && contextTooLong && <div className="ai-chat-banner" role="status"><p>대화가 길어졌어요. 질문을 줄이거나 새 대화를 시작해 주세요. 한 대화에 담을 수 있는 길이는 총 12,000자예요.</p></div>}

      <form className={`ai-chat-composer${authenticated ? "" : " is-locked"}`} onSubmit={event => { event.preventDefault(); void sendMessage(); }}>
        <label className="ai-chat-composer-label" htmlFor="ai-message">부모님의 한마디</label>
        <textarea ref={composer} id="ai-message" aria-label="AI에게 보낼 메시지" aria-describedby="ai-chat-privacy ai-chat-memory" placeholder={authenticated ? suggestedMessage : "로그인 후 메시지를 보낼 수 있어요."} rows={embedded ? 1 : 3} maxLength={maxCharacters} disabled={!canCompose || busy || conversationFull} value={draft} onChange={event => { setDraft(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && !event.nativeEvent.isComposing && !draft && canCompose) { event.preventDefault(); setDraft(suggestedMessage); setError(""); return; } if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} />
        <div className="ai-chat-composer-bottom">
          <div className="ai-chat-composer-tools">{modelControl}</div>
          <div className="ai-chat-composer-actions">{voiceControl}{embedded && <button type="button" className="ai-chat-voice-toggle" aria-label={voice.active ? "고급 음성 종료" : "고급 음성 시작"} aria-pressed={voice.active} disabled={!voice.available || (!voice.active && (!canCompose || busy || Boolean(draft)))} onClick={() => { if (voice.active) { voice.stop(); setPendingQuestion(""); } else { setError(""); setNotice(""); setOptionsOpen(false); void voice.start(); } }}><Mic size={18} aria-hidden="true" /><span>{voice.active ? "음성 종료" : "음성"}</span></button>}{busy ? <button key="stop" type="button" className="ai-chat-stop" onClick={event => { event.preventDefault(); stopResponse(); }}><Square size={13} fill="currentColor" aria-hidden="true" />응답 중지</button> : <button key="send" type="submit" className="ai-chat-send" aria-label="보내기" title="보내기" disabled={!canSend}><ArrowUp size={17} aria-hidden="true" /></button>}</div>
        </div>
      </form>
      {embedded && voice.active && <p className="ai-chat-live-status" role="status"><span>{voice.status}</span>{voice.muted && <span> · <span>마이크가 꺼져 있어요.</span></span>}{voice.audioBlocked && <button type="button" onClick={voice.resumeAudio}>소리 재생 허용</button>}</p>}

    </section>
  );
}
