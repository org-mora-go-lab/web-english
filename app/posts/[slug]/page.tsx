import { notFound } from "next/navigation";

import { PostDetail } from "@/src/1-page/post-detail";
import { LoginInvitation } from "@/src/3-feature";
import { getActor } from "@/src/4-entity/account";
import { getPostBySlug, getPostDetails, mayRead } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const actor = await getActor();
  if (!actor) return <LoginInvitation returnTo={`/posts/${encodeURIComponent(slug)}`} />;
  const post = await getPostBySlug(slug);
  if (!post || !mayRead(post, actor)) notFound();
  return <PostDetail post={await getPostDetails(post)} />;
}
