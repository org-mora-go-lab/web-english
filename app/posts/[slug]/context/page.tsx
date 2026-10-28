import { notFound } from "next/navigation";

import { LearningContext } from "@/src/1-page/learning-context";
import { getActor } from "@/src/4-entity/account";
import { getPostBySlug, mayRead } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);
  if (!post || !mayRead(post, await getActor())) notFound();
  return <LearningContext title={post.title} summary={post.summary} content={post.contentText} level={post.level} slug={post.slug} />;
}
