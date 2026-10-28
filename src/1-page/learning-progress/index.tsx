import Link from "next/link";

import type { LearningProgressProps } from "./type";

export function LearningProgress({ items }: LearningProgressProps) {
  return <main className="learning-progress mx-auto max-w-3xl space-y-6 px-4 py-8 text-slate-900"><Link href="/studio" className="font-semibold text-orange-700">← 스튜디오</Link><h1 className="text-3xl font-bold">나의 학습 진도</h1>{items.length ? items.map(item => <Link key={item.postId} href={`/learn/${item.postId}`} className="block rounded-xl border p-4"><h2 className="font-semibold">{item.title}</h2><p className="text-sm text-slate-600">{item.status === "completed" ? "완료" : "학습 중"} · {new Date(item.updatedAt).toLocaleDateString("ko-KR")}</p></Link>) : <p className="rounded-xl border p-8">아직 학습한 글이 없습니다. <Link href="/posts" className="underline">학습 글 보기</Link></p>}</main>;
}
