"use client";

import Link from "next/link";
import { useState } from "react";

import type { LearningContextProps } from "./type";

export function LearningContext({ title, summary, content, level, slug }: LearningContextProps) {
  const [message, setMessage] = useState("");
  const context = `영어 학습 자료: ${title}\n난이도: ${level}\n요약: ${summary}\n본문: ${content}\n\nPaul, 이 자료로 영어 대화를 연습하고 이해도 질문을 해 주세요.`;
  async function copy(value: string) { try { await navigator.clipboard.writeText(value); setMessage("복사했습니다."); } catch { setMessage("복사할 수 없습니다. 아래 텍스트를 직접 선택해 주세요."); } }
  return <main className="learning-context mx-auto max-w-3xl space-y-6 px-4 py-8 text-slate-900"><Link href={`/posts/${slug}`} className="font-semibold text-orange-700">← 글로 돌아가기</Link><h1 className="text-3xl font-bold">Paul 학습 컨텍스트</h1><p>아래 내용을 복사해 ChatGPT의 Paul 대화에 붙여 넣으세요. 이 페이지의 URL도 공유할 수 있습니다.</p><div className="flex flex-wrap gap-3"><button onClick={() => void copy(context)} className="rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white">학습 컨텍스트 복사</button><button onClick={() => void copy(location.href)} className="rounded-lg border px-4 py-3">URL 복사</button></div>{message && <p role="status">{message}</p>}<pre className="whitespace-pre-wrap rounded-xl border bg-slate-50 p-5 text-sm">{context}</pre></main>;
}
