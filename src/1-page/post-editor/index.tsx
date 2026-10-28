"use client";

import { Node } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { EditorContent, NodeViewWrapper, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import type { ContentDocument } from "@/src/4-entity/post";
import { PostContent } from "@/src/4-entity/post";

import type { LearningBlockViewProps, PostEditorProps } from "./type";

function LearningBlockView({ node, updateAttributes }: LearningBlockViewProps) {
  const fields = node.type.name === "vocabulary" ? [["word", "단어"], ["meaning", "뜻"], ["example", "예문"]] : node.type.name === "dialogue" ? [["speaker", "화자"], ["line", "대화문"]] : [["question", "질문"], ["options", "선택지 (쉼표로 구분)"], ["answer", "정답"]];
  return <NodeViewWrapper className="my-3 rounded-xl border border-orange-200 bg-orange-50 p-4" contentEditable={false}>
    <strong className="mb-2 block text-orange-800">{node.type.name === "vocabulary" ? "영어 단어" : node.type.name === "dialogue" ? "영어 대화문" : "퀴즈"}</strong>
    <div className="grid gap-2 sm:grid-cols-2">{fields.map(([key, label]) => <label key={key} className="text-sm">{label}<input className="mt-1 w-full rounded-lg border bg-white p-2" value={node.attrs[key] ?? ""} onChange={event => updateAttributes({ [key]: event.target.value })}/></label>)}</div>
  </NodeViewWrapper>;
}

function learningNode(name: "vocabulary" | "dialogue" | "quiz", keys: string[]) {
  return Node.create({
    name, group: "block", atom: true,
    addAttributes() { return Object.fromEntries(keys.map(key => [key, { default: "" }])); },
    parseHTML() { return [{ tag: `div[data-learning-block="${name}"]` }]; },
    renderHTML({ HTMLAttributes }) { return ["div", { ...HTMLAttributes, "data-learning-block": name }, `${name}: ${keys.map(key => HTMLAttributes[key] ?? "").join(" · ")}`]; },
    addNodeView() { return ReactNodeViewRenderer(LearningBlockView); },
  });
}

const vocabulary = learningNode("vocabulary", ["word", "meaning", "example"]);
const dialogue = learningNode("dialogue", ["speaker", "line"]);
const quiz = learningNode("quiz", ["question", "options", "answer"]);
const emptyDocument: ContentDocument = { type: "doc", content: [{ type: "paragraph", content: [] }] };

export function PostEditor({ initial }: PostEditorProps) {
  const router = useRouter();
  const [id, setId] = useState(initial?.id ?? "");
  const [version, setVersion] = useState(initial?.version ?? 0);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [level, setLevel] = useState(initial?.level ?? "beginner");
  const [visibility, setVisibility] = useState(initial?.visibility ?? "private");
  const [coverImageUrl, setCoverImageUrl] = useState(initial?.coverImageUrl ?? "");
  const [document, setDocument] = useState<ContentDocument>(initial?.contentJson ?? emptyDocument);
  const [status, setStatus] = useState(initial?.status ?? "draft");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [revisions, setRevisions] = useState<{ version: number; createdAt: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const savingRef = useRef(false);
  const idRef = useRef(id);
  const versionRef = useRef(version);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Image, vocabulary, dialogue, quiz],
    content: initial?.contentJson ?? emptyDocument,
    onUpdate({ editor }) { setDocument(editor.getJSON() as ContentDocument); },
  });

  const payload = { title, summary, category, tags: tags.split(",").map(item => item.trim()).filter(Boolean), level, visibility, coverImageUrl: coverImageUrl || null, contentJson: document };
  const serialized = JSON.stringify(payload);
  const lastSaved = useRef(initial ? serialized : "");

  async function save() {
    if (savingRef.current || !title.trim()) return idRef.current || null;
    if (idRef.current && serialized === lastSaved.current) return idRef.current;
    savingRef.current = true; setSaving(true); setError("");
    try {
      const currentId = idRef.current;
      const response = await fetch(currentId ? `/api/posts/${currentId}` : "/api/posts", { method: currentId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(currentId ? { ...payload, version: versionRef.current } : payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "저장하지 못했습니다.");
      idRef.current = result.post.id; versionRef.current = result.post.version;
      setId(result.post.id); setVersion(result.post.version);
      lastSaved.current = serialized;
      setMessage("저장했습니다.");
      if (!currentId) router.replace(`/studio/posts/${result.post.id}/edit`);
      return result.post.id as string;
    } catch (cause) { setError(cause instanceof Error ? cause.message : "저장하지 못했습니다."); return null; }
    finally { savingRef.current = false; setSaving(false); }
  }

  useEffect(() => {
    if (!title.trim() || serialized === lastSaved.current) return;
    const timer = window.setTimeout(() => { void save(); }, 1800);
    return () => window.clearTimeout(timer);
  // save uses the latest render's payload. Version changes trigger a retry after concurrent edits.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serialized, version]);

  async function publish(next: boolean) {
    const savedId = await save();
    if (!savedId) return;
    const response = await fetch(`/api/posts/${savedId}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ publish: next }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "발행 상태를 바꾸지 못했습니다."); return; }
    setStatus(result.post.status); setMessage(next ? "글을 발행했습니다." : "발행을 취소했습니다.");
  }

  async function upload(file: File) {
    const form = new FormData(); form.set("file", file);
    const response = await fetch("/api/media", { method: "POST", body: form });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "이미지 업로드에 실패했습니다."); return; }
    editor?.chain().focus().setImage({ src: result.asset.url, alt: file.name }).run();
    if (!coverImageUrl) setCoverImageUrl(result.asset.url);
  }

  async function loadRevisions() {
    if (!idRef.current) return;
    const response = await fetch(`/api/posts/${idRef.current}/revisions`);
    if (response.ok) setRevisions((await response.json()).revisions);
  }

  async function restore(version: number) {
    const response = await fetch(`/api/posts/${idRef.current}/revisions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ version }) });
    if (!response.ok) { setError("버전을 복원하지 못했습니다."); return; }
    const result = await response.json();
    const restored = JSON.parse(result.post.contentJson) as ContentDocument;
    editor?.commands.setContent(restored);
    setDocument(restored);
    versionRef.current = result.post.version;
    setVersion(result.post.version);
    lastSaved.current = JSON.stringify({ ...payload, contentJson: restored });
    setMessage("이전 버전을 복원했습니다.");
  }

  return <main className="post-editor mx-auto max-w-5xl space-y-5 px-4 py-6 text-slate-900">
    <nav className="flex flex-wrap items-center justify-between gap-3"><Link href="/studio" className="font-semibold text-orange-700">← 스튜디오</Link><div className="flex flex-wrap gap-2"><button onClick={() => setPreview(!preview)} className="rounded-lg border px-3 py-2">{preview ? "편집" : "미리보기"}</button><button onClick={() => void save()} disabled={saving} className="rounded-lg border px-3 py-2">{saving ? "저장 중…" : "임시 저장"}</button><button disabled={saving} onClick={() => void publish(status !== "published")} className="rounded-lg bg-orange-600 px-3 py-2 font-semibold text-white">{status === "published" ? "발행 취소" : "발행"}</button></div></nav>
    <h1 className="text-3xl font-bold">{id ? "글 편집" : "새 글 작성"}</h1>
    {message && <p role="status" className="rounded-lg bg-green-50 p-3 text-green-800">{message}</p>}{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
    <div className="grid gap-3 sm:grid-cols-2"><label className="sm:col-span-2">제목<input aria-label="제목" value={title} maxLength={180} onChange={event => setTitle(event.target.value)} className="mt-1 w-full rounded-lg border p-3 text-xl" /></label><label className="sm:col-span-2">요약<textarea aria-label="요약" value={summary} maxLength={500} onChange={event => setSummary(event.target.value)} className="mt-1 w-full rounded-lg border p-3" /></label><label>카테고리<input aria-label="카테고리" value={category} onChange={event => setCategory(event.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label><label>태그 (쉼표로 구분)<input aria-label="태그" value={tags} onChange={event => setTags(event.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label><label>난이도<select aria-label="난이도" value={level} onChange={event => setLevel(event.target.value as typeof level)} className="mt-1 w-full rounded-lg border p-3"><option value="beginner">초급</option><option value="intermediate">중급</option><option value="advanced">고급</option></select></label><label>공개 설정<select aria-label="공개 설정" value={visibility} onChange={event => setVisibility(event.target.value as typeof visibility)} className="mt-1 w-full rounded-lg border p-3"><option value="private">비공개</option><option value="public">공개</option></select></label></div>
    {preview ? <div className="rounded-xl border bg-white p-6"><PostContent document={document}/></div> : <><div className="flex flex-wrap gap-2 rounded-xl border bg-slate-50 p-3 text-sm"><button onClick={() => editor?.chain().focus().toggleBold().run()} className="rounded border bg-white px-3 py-2">굵게</button><button onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} className="rounded border bg-white px-3 py-2">제목</button><button onClick={() => editor?.chain().focus().toggleBulletList().run()} className="rounded border bg-white px-3 py-2">목록</button><button onClick={() => fileInput.current?.click()} className="rounded border bg-white px-3 py-2">이미지</button><button onClick={() => editor?.chain().focus().insertContent({ type: "vocabulary", attrs: { word: "", meaning: "", example: "" } }).run()} className="rounded border bg-white px-3 py-2">단어 블록</button><button onClick={() => editor?.chain().focus().insertContent({ type: "dialogue", attrs: { speaker: "", line: "" } }).run()} className="rounded border bg-white px-3 py-2">대화 블록</button><button onClick={() => editor?.chain().focus().insertContent({ type: "quiz", attrs: { question: "", options: "", answer: "" } }).run()} className="rounded border bg-white px-3 py-2">퀴즈 블록</button><input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ""; }}/></div><div className="rounded-xl border bg-white"><EditorContent editor={editor} aria-label="본문 편집기" /></div></>}
    {id && <section className="space-y-2 border-t pt-5"><div className="flex flex-wrap gap-4"><button onClick={() => void loadRevisions()} className="underline">버전 기록 보기</button>{initial?.slug && <Link href={`/posts/${initial.slug}`} className="underline">글 보기</Link>}</div>{revisions.map(item => <button key={item.version} onClick={() => void restore(item.version)} className="mr-2 rounded border p-2 text-sm">버전 {item.version} · {new Date(item.createdAt).toLocaleString("ko-KR")} 복원</button>)}</section>}
  </main>;
}
