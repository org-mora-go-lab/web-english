"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

import type { StudioProps } from "./type";

export function Studio({ displayName, posts }: StudioProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  async function remove(id: string) {
    if (!window.confirm("이 글을 삭제할까요? 복구할 수 없습니다.")) return;
    const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (!response.ok) { setError("글을 삭제하지 못했습니다."); return; }
    router.refresh();
  }
  return <main className="studio mx-auto max-w-5xl space-y-8 px-4 py-8 text-slate-900"><nav className="flex flex-wrap items-center justify-between gap-3"><Link href="/" className="font-bold text-orange-700">mora english</Link><div className="flex flex-wrap gap-4 text-sm"><Link href="/posts">공개 글</Link><Link href="/learn/progress">학습 진도</Link><Link href="/settings/account">계정 설정</Link><button onClick={() => signOut({ callbackUrl: "/login" })}>로그아웃</button></div></nav><header><h1 className="text-3xl font-bold">{displayName}님의 스튜디오</h1><p className="mt-2 text-slate-600">영어 학습 글을 쓰고 공유하세요.</p></header><div className="flex flex-wrap gap-3"><Link href="/studio/posts/new" className="rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white">새 글 작성</Link><Link href="/studio/import" className="rounded-lg border px-4 py-3">Paul·파일 가져오기</Link><Link href="/studio/media" className="rounded-lg border px-4 py-3">이미지 관리</Link></div>{error && <p role="alert">{error}</p>}<section className="space-y-3"><h2 className="text-xl font-semibold">내 글</h2>{posts.length ? posts.map(post => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><h3 className="font-semibold">{post.title}</h3><p className="text-sm text-slate-500">{post.status === "published" ? "발행됨" : "임시 저장"} · {post.visibility === "public" ? "공개" : "비공개"} · {new Date(post.updatedAt).toLocaleString("ko-KR")}</p></div><div className="flex gap-3 text-sm"><Link href={`/studio/posts/${post.id}/edit`} className="text-orange-700 underline">편집</Link><Link href={`/posts/${post.slug}`} className="underline">보기</Link><button onClick={() => void remove(post.id)} className="text-red-700 underline">삭제</button></div></div>) : <p className="rounded-xl border p-8 text-slate-500">아직 작성한 글이 없습니다.</p>}</section></main>;
}
