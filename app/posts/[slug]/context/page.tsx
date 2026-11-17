import { notFound } from "next/navigation";

import { LearningContext } from "@/src/1-page/learning-context";
import { LoginInvitation } from "@/src/3-feature";
import { getActor } from "@/src/4-entity/account";
import { getPostBySlug, mayRead } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const actor = await getActor();
  if (!actor) return <LoginInvitation returnTo={`/posts/${encodeURIComponent(slug)}/context`} />;
  const post = await getPostBySlug(slug);
  if (!post || !mayRead(post, actor)) notFound();
  return <LearningContext title={post.title} summary={post.summary} content={post.contentText} level={post.level} slug={post.slug} />;
}
