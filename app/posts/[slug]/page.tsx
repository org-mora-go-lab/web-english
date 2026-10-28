import { notFound } from "next/navigation";

import { PostDetail } from "@/src/1-page/post-detail";
import { getActor } from "@/src/4-entity/account";
import { getPostBySlug, getPostDetails, mayRead } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPostBySlug((await params).slug);
  if (!post || !mayRead(post, await getActor())) notFound();
  return <PostDetail post={await getPostDetails(post)} />;
}
