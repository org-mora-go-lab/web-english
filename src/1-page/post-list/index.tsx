import Image from "next/image";
import Link from "next/link";

import type { PostListProps } from "./type";

export function PostList({ posts }: PostListProps) {
  return <main className="post-list mx-auto max-w-5xl px-4 py-8 text-slate-900">
    <nav className="flex flex-wrap justify-between gap-4"><Link href="/" className="font-bold text-orange-700">mora english</Link><div className="flex gap-4"><Link href="/studio">내 스튜디오</Link><Link href="/login">로그인</Link></div></nav>
    <header className="my-10"><h1 className="text-4xl font-bold">영어 학습 글</h1><p className="mt-2 text-slate-600">회원이 직접 쓰고 공유한 영어 학습 콘텐츠입니다.</p></header>
    {posts.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{posts.map(post => <Link key={post.id} href={`/posts/${post.slug}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:border-orange-300">{post.coverImageUrl && <Image unoptimized width={1200} height={800} src={post.coverImageUrl} alt="" className="h-40 w-full object-cover" />}<div className="p-5"><p className="text-xs uppercase text-orange-700">{post.level}</p><h2 className="mt-2 text-xl font-semibold">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm text-slate-600">{post.summary}</p><p className="mt-4 text-xs text-slate-500">{new Date(post.updatedAt).toLocaleDateString("ko-KR")}</p></div></Link>)}</div> : <p className="rounded-2xl border p-8 text-slate-600">아직 공개된 글이 없습니다.</p>}
  </main>;
}
