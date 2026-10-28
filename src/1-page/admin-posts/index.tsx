import Link from "next/link";

import type { AdminPostsProps } from "./type";

export function AdminPosts({ posts }: AdminPostsProps) {
  return <main className="admin-posts mx-auto max-w-5xl space-y-6 px-4 py-8 text-slate-900"><nav className="flex flex-wrap gap-4"><Link href="/studio">스튜디오</Link><Link href="/admin/users">회원 관리</Link></nav><h1 className="text-3xl font-bold">콘텐츠 관리</h1><div className="space-y-3">{posts.map(post => <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"><div><strong>{post.title}</strong><p className="text-sm text-slate-600">{post.status} · {post.visibility} · {new Date(post.updatedAt).toLocaleDateString("ko-KR")}</p></div><Link href={`/studio/posts/${post.id}/edit`} className="text-orange-700 underline">관리</Link></div>)}</div></main>;
}
