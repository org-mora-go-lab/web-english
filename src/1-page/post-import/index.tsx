"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostImport() {
  const router = useRouter();
  const [format, setFormat] = useState<"markdown" | "json">("markdown");
  const [source, setSource] = useState<"paul" | "import">("paul");
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/posts/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ format, source, text }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "가져오지 못했습니다.");
      router.push(`/studio/posts/${data.post.id}/edit`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "가져오지 못했습니다."); }
    finally { setBusy(false); }
  }
  return <main className="post-import mx-auto max-w-3xl space-y-6 px-4 py-8 text-slate-900"><Link href="/studio" className="font-semibold text-orange-700">← 스튜디오</Link><h1 className="text-3xl font-bold">Paul 콘텐츠 가져오기</h1><p className="text-slate-600">Paul이 제안한 Markdown 또는 JSON을 붙여 넣거나 파일을 선택하세요. 비공개 임시 글로 저장한 뒤 편집·미리보기·발행할 수 있습니다.</p><form onSubmit={submit} className="space-y-4"><div className="flex flex-wrap gap-4"><label>형식<select aria-label="가져오기 형식" value={format} onChange={event => setFormat(event.target.value as typeof format)} className="ml-2 rounded-lg border p-2"><option value="markdown">Markdown</option><option value="json">JSON</option></select></label><label>출처<select aria-label="콘텐츠 출처" value={source} onChange={event => setSource(event.target.value as typeof source)} className="ml-2 rounded-lg border p-2"><option value="paul">Paul</option><option value="import">외부 파일</option></select></label></div><label className="block">파일 선택<input type="file" accept=".md,.markdown,.json,text/markdown,application/json" className="mt-1 block" onChange={async event => { const file = event.target.files?.[0]; if (file) { setFormat(file.name.endsWith(".json") ? "json" : "markdown"); setText(await file.text()); } }} /></label><label className="block">콘텐츠<textarea aria-label="가져올 콘텐츠" required rows={16} value={text} onChange={event => setText(event.target.value)} className="mt-1 w-full rounded-xl border p-4 font-mono text-sm" placeholder="# 제목\n\n영어 학습 내용을 입력하세요."/></label>{error && <p role="alert" className="text-red-700">{error}</p>}<button disabled={busy} className="rounded-lg bg-orange-600 px-5 py-3 font-semibold text-white">{busy ? "가져오는 중…" : "비공개 글로 가져오기"}</button></form></main>;
}
