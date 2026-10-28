"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { ContentNode } from "@/src/4-entity/post";
import { PostContent } from "@/src/4-entity/post";

import type { LearnProps } from "./type";

function questions(document: LearnProps["post"]["contentJson"]) {
  const result: ContentNode[] = [];
  function walk(node: ContentNode) { if (node.type === "quiz") result.push(node); node.content?.forEach(walk); }
  document.content.forEach(walk); return result;
}

export function Learn({ post, signedIn, initialStatus }: LearnProps) {
  const [status, setStatus] = useState(initialStatus);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!signedIn || status) return;
    void fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, status: "started" }) }).then(response => { if (response.ok) setStatus(current => current === "completed" ? current : "started"); });
  }, [post.id, signedIn, status]);
  async function complete() {
    const response = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, status: "completed" }) });
    if (!response.ok) { setError("학습 진도를 저장하지 못했습니다."); return; }
    setStatus("completed"); setMessage("학습 완료를 저장했습니다.");
  }
  async function submit(index: number) {
    const response = await fetch("/api/quiz-attempts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId: post.id, questionId: index, answer: answers[String(index)] ?? "" }) });
    const data = await response.json();
    if (!response.ok) { setError(data.error ?? "답안을 저장하지 못했습니다."); return; }
    setResults({ ...results, [String(index)]: data.isCorrect });
  }
    const quiz = questions(post.contentJson);
  return <main className="learn mx-auto max-w-3xl space-y-7 px-4 py-8 text-slate-900"><nav className="flex flex-wrap justify-between gap-3"><Link href={`/posts/${post.slug}`} className="font-semibold text-orange-700">← 글로 돌아가기</Link><Link href="/learn/progress">나의 학습 진도</Link></nav><header><p className="text-sm text-orange-700">영어 학습</p><h1 className="mt-2 text-3xl font-bold">{post.title}</h1></header>{!signedIn && <p className="rounded-xl bg-orange-50 p-4">진도를 저장하려면 <Link href={`/login?callbackUrl=${encodeURIComponent(`/learn/${post.id}`)}`} className="font-semibold underline">로그인</Link>하세요.</p>}<PostContent document={post.contentJson}/>{quiz.length > 0 && <section className="space-y-4 border-t pt-6"><h2 className="text-xl font-bold">이해도 확인</h2>{quiz.map((question, index) => <div key={index} className="rounded-xl border p-4"><h3 className="font-semibold">{question.attrs?.question}</h3>{question.attrs?.options && <p className="text-sm text-slate-600">{question.attrs.options}</p>}<div className="mt-3 flex gap-2"><input aria-label={`문제 ${index + 1} 답안`} value={answers[String(index)] ?? ""} onChange={event => setAnswers({ ...answers, [String(index)]: event.target.value })} className="min-w-0 flex-1 rounded-lg border p-2"/><button disabled={!signedIn} onClick={() => void submit(index)} className="rounded-lg bg-slate-900 px-3 text-white">확인</button></div>{String(index) in results && <p role="status" className="mt-2">{results[String(index)] ? "정답입니다!" : "다시 생각해 보세요."}</p>}</div>)}</section>}{error && <p role="alert" className="text-red-700">{error}</p>}{message && <p role="status" className="text-green-800">{message}</p>}<button disabled={!signedIn} onClick={() => void complete()} className="rounded-xl bg-orange-600 px-5 py-3 font-semibold text-white">{status === "completed" ? "학습 완료됨" : "학습 완료 저장"}</button></main>;
}
