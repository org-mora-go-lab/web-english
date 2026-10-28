import Link from "next/link";

import { PostContent } from "@/src/4-entity/post";

import type { PostDetailProps } from "./type";

export function PostDetail({ post }: PostDetailProps) {
  return <main className="post-detail mx-auto max-w-3xl px-4 py-8 text-slate-900"><nav className="flex flex-wrap justify-between gap-3"><Link href="/posts" className="font-semibold text-orange-700">← 학습 글 목록</Link><Link href="/studio">스튜디오</Link></nav><header className="my-10 border-b pb-8"><p className="text-sm text-orange-700">{post.category || "영어 학습"} · {post.level}{post.visibility === "private" ? " · 비공개" : ""}</p><h1 className="mt-3 text-4xl font-bold">{post.title}</h1><p className="mt-4 text-lg text-slate-600">{post.summary}</p><p className="mt-4 text-sm text-slate-500">{post.authorName} · {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("ko-KR") : "임시 저장"}</p><div className="mt-4 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs">#{tag}</span>)}</div></header><PostContent document={post.contentJson}/><div className="mt-10 flex flex-wrap gap-3 border-t pt-6"><Link href={`/learn/${post.id}`} className="rounded-lg bg-orange-600 px-4 py-3 font-semibold text-white">이 글로 학습하기</Link><Link href={`/posts/${post.slug}/context`} className="rounded-lg border px-4 py-3">Paul 학습 컨텍스트</Link></div></main>;
}
