"use client";

import { ArrowDown, ArrowUp, Check, ChevronDown, MessageCircle, Plus, RefreshCw, Sparkles, Square } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import type { AiChatProps, ChatConfiguration, ChatMessage, ChatMode } from "./type";

const modelStorageKey = "mora-english-ai-model";
const maxMessages = 20;
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

export function AiChat({ signedIn }: AiChatProps) {
  const [configuration, setConfiguration] = useState<ChatConfiguration | null>(null);
  const [configurationLoading, setConfigurationLoading] = useState(true);
  const [configurationError, setConfigurationError] = useState(false);
  const [model, setModel] = useState("");
  const [mode, setMode] = useState<ChatMode>("parent");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loginRequired, setLoginRequired] = useState(!signedIn);
  const request = useRef<AbortController | null>(null);
  const configurationRequest = useRef<AbortController | null>(null);
  const composer = useRef<HTMLTextAreaElement | null>(null);
  const conversationEnd = useRef<HTMLDivElement | null>(null);

  const loadConfiguration = useCallback(async () => {
    configurationRequest.current?.abort();
    const controller = new AbortController();
    configurationRequest.current = controller;
    try {
      const response = await fetch("/api/ai/models", { signal: controller.signal, cache: "no-store" });
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
    queueMicrotask(() => { if (!disposed) void loadConfiguration(); });
    return () => { disposed = true; configurationRequest.current?.abort(); request.current?.abort(); };
  }, [loadConfiguration]);

  useEffect(() => {
    if (messages.length || pendingQuestion) conversationEnd.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [messages, pendingQuestion]);

  const activeModel = configuration?.models.find(item => item.id === model);
  const conversationFull = messages.length >= maxMessages;
  const contextTooLong = messages.reduce((total, item) => total + item.content.length, 0) + draft.trim().length > 12000;
  const canCompose = !loginRequired && Boolean(configuration?.configured && activeModel) && !configurationLoading && !configurationError;
  const canSend = canCompose && !busy && !conversationFull && !contextTooLong && Boolean(draft.trim()) && draft.length <= maxCharacters;

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
    setMode(nextMode);
    setMessages([]);
    setDraft("");
    setError("");
    setPendingQuestion("");
    setNotice(nextMode === mode ? "새 대화를 시작했어요." : "대화 모드를 바꿨어요. 새 대화를 시작해 주세요.");
    composer.current?.focus();
  }

  function stopResponse() {
    request.current?.abort();
    request.current = null;
    setBusy(false);
    setPendingQuestion("");
    setError("");
    setNotice("응답 생성을 중지했어요. 작성한 질문은 남아 있어요.");
  }

  async function sendMessage() {
    if (!canSend || request.current) return;
    const content = draft.trim();
    const chosenModel = model;
    const history = messages.map(item => ({ role: item.role, content: item.content }));
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    setNotice("");
    setPendingQuestion(content);
    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: chosenModel, mode, messages: [...history, { role: "user", content }] }),
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
      setDraft("");
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof Error && !(failure instanceof TypeError) ? failure.message : "연결이 잠시 끊겼어요. 작성한 질문은 남아 있으니 다시 보내 주세요.");
    } finally {
      if (request.current === controller) {
        request.current = null;
        setBusy(false);
        setPendingQuestion("");
      }
    }
  }

  return (
    <section className="ai-chat" id="ai-chat" aria-label="AI 영어 도우미">
      <div className="ai-chat-toolbar">
        <div className="ai-chat-modes" role="group" aria-label="대화 모드">
          <button type="button" aria-pressed={mode === "parent"} disabled={busy} onClick={() => mode !== "parent" && startFresh("parent")}><Sparkles size={16} aria-hidden="true" />부모 영어 놀이</button>
          <button type="button" aria-pressed={mode === "practice"} disabled={busy} onClick={() => mode !== "practice" && startFresh("practice")}><MessageCircle size={16} aria-hidden="true" />영어 회화 연습</button>
        </div>
        <button type="button" className="ai-chat-new" disabled={busy || (!messages.length && !draft)} onClick={() => startFresh()}><Plus size={16} aria-hidden="true" />새 대화</button>
      </div>

      <div className="ai-chat-model-row">
        <div className="ai-chat-model-choice">
          <label htmlFor="ai-model">AI 모델</label>
          <div className="ai-chat-select"><select id="ai-model" value={model} disabled={busy || configurationLoading || configurationError || !configuration?.models.length} onChange={event => selectModel(event.target.value)}>{configuration?.models.length ? configuration.models.map(item => <option value={item.id} key={item.id}>{item.name}</option>) : <option value="">{configurationLoading ? "모델 불러오는 중…" : configurationError ? "모델을 불러오지 못했어요" : "모델 준비 중"}</option>}</select><ChevronDown size={15} aria-hidden="true" /></div>
          {configuration && !configurationLoading && !configurationError && <span className={`ai-chat-connection ${configuration.configured ? "is-ready" : ""}`}>{configuration.configured ? <Check size={13} aria-hidden="true" /> : <span className="ai-chat-status-dot" />}{configuration.configured ? "AI 사용 가능" : "연결 준비 중"}</span>}
        </div>
        <p>{activeModel?.description ?? "부모님께 맞는 모델을 골라 보세요."}</p>
        <small>모델에 따라 응답 속도와 API 사용 비용이 달라집니다. 선택한 모델은 이 브라우저에 기억해요.</small>
      </div>

      {configurationError && <div className="ai-chat-banner ai-chat-error" role="alert"><p>모델 정보를 불러오지 못했어요. 연결 상태를 다시 확인해 주세요.</p><button type="button" onClick={retryConfiguration}><RefreshCw size={14} aria-hidden="true" />연결 상태 다시 확인</button></div>}
      {!configurationError && !configurationLoading && configuration && !configuration.configured && <div className="ai-chat-banner" role="status"><p><strong>AI 연결을 준비하고 있어요.</strong><br />연결이 완료되면 선택한 모델과 대화할 수 있어요.</p><button type="button" onClick={retryConfiguration}><RefreshCw size={14} aria-hidden="true" />연결 상태 다시 확인</button></div>}

      <div className="ai-chat-conversation" role="log" aria-label="AI 대화" aria-live="polite" aria-busy={busy}>
        {!messages.length && !pendingQuestion && <div className="ai-chat-welcome">
          <div className="ai-chat-welcome-mark" aria-hidden="true"><Sparkles size={25} strokeWidth={1.5} /></div>
          <span className="ai-chat-welcome-eyebrow">{mode === "parent" ? "LET'S MAKE PLAYTIME SIMPLE" : "A SMALL CONVERSATION, EVERY DAY"}</span>
          <h2>{mode === "parent" ? "오늘, 어떤 놀이를 준비할까요?" : "틀려도 괜찮아요. 한마디부터."}</h2>
          <p>{mode === "parent" ? "익숙한 하루의 장면을 알려 주세요.\n아이와 함께할 쉬운 영어와 놀이를 생각해 드릴게요." : "부모님을 위한 편안한 영어 연습이에요.\n짧은 인사나 오늘 있었던 일부터 이야기해 보세요."}</p>
          <div className="ai-chat-starters">{starterPrompts[mode].map(item => <button type="button" key={item.label} disabled={!canCompose} onClick={() => { setDraft(item.prompt); setError(""); composer.current?.focus(); }}><span>{item.label}</span><ArrowDown size={14} aria-hidden="true" /></button>)}</div>
        </div>}
        {messages.map(item => <article key={item.id} className={`ai-chat-message is-${item.role}`} data-testid={`ai-message-${item.role}`}><div className="ai-chat-message-label">{item.role === "user" ? "나" : <><Sparkles size={14} aria-hidden="true" />영어 도우미<span>{configuration?.models.find(value => value.id === item.model)?.name ?? item.model}</span></>}</div><p>{item.content}</p></article>)}
        {pendingQuestion && <><article className="ai-chat-message is-user is-pending" data-testid="ai-message-pending"><div className="ai-chat-message-label">나</div><p>{pendingQuestion}</p></article><div className="ai-chat-thinking" role="status"><span aria-hidden="true">✦</span>{activeModel?.name}이 답변을 준비하고 있어요…</div></>}
        <div ref={conversationEnd} />
      </div>

      {loginRequired && <div className="ai-chat-login-card"><div><strong>{signedIn ? "다시 로그인해 주세요." : "부모님, 로그인하고 시작해 보세요."}</strong><p>{signedIn ? "로그인 시간이 만료됐어요. 다시 로그인한 뒤 대화할 수 있어요." : "모델을 고르고 우리 가족에게 맞는 영어를 준비할 수 있어요."}</p></div><Link href="/login?callbackUrl=/ai">로그인하고 대화하기<ArrowUp size={15} aria-hidden="true" /></Link></div>}

      {error && <div className="ai-chat-banner ai-chat-error" role="alert"><p>{error}</p>{!loginRequired && <button type="button" disabled={!canSend} onClick={() => void sendMessage()}><RefreshCw size={14} aria-hidden="true" />다시 보내기</button>}</div>}
      {notice && <p className="ai-chat-notice" role="status">{notice}</p>}
      {conversationFull && <div className="ai-chat-banner" role="status"><p>이번 대화에서 10번의 이야기를 나눴어요. 새 대화로 이어가 주세요.</p></div>}
      {!conversationFull && contextTooLong && <div className="ai-chat-banner" role="status"><p>대화가 길어졌어요. 질문을 줄이거나 새 대화를 시작해 주세요. 한 대화에 담을 수 있는 길이는 총 12,000자예요.</p></div>}

      <form className="ai-chat-composer" onSubmit={event => { event.preventDefault(); void sendMessage(); }}>
        <label className="ai-chat-composer-label" htmlFor="ai-message">부모님의 한마디</label>
        <textarea ref={composer} id="ai-message" aria-label="AI에게 보낼 메시지" aria-describedby="ai-chat-privacy ai-chat-memory" placeholder={mode === "parent" ? "예: 공놀이할 때 아이에게 무슨 영어를 해주면 좋을까요?" : "예: I'd like to practice talking about my day."} rows={3} maxLength={maxCharacters} disabled={!canCompose || busy || conversationFull} value={draft} onChange={event => { setDraft(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void sendMessage(); } }} />
        <div className="ai-chat-composer-bottom"><span>{draft.length.toLocaleString()} / 2,000<span className="ai-chat-key-hint"> · Shift + Enter 줄바꿈</span></span>{busy ? <button key="stop" type="button" className="ai-chat-stop" onClick={event => { event.preventDefault(); stopResponse(); }}><Square size={13} fill="currentColor" aria-hidden="true" />응답 중지</button> : <button key="send" type="submit" className="ai-chat-send" disabled={!canSend}>보내기<ArrowUp size={17} aria-hidden="true" /></button>}</div>
      </form>
      <div className="ai-chat-privacy"><p id="ai-chat-memory">대화는 이 화면에만 유지되며, 새로고침하거나 페이지를 나가면 사라져요.</p><p id="ai-chat-privacy">입력한 대화는 답변 생성을 위해 OpenAI로 전송됩니다. 아이의 이름 등 개인정보는 입력하지 마세요.</p></div>
    </section>
  );
}
