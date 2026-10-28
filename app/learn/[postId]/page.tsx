import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { Learn } from "@/src/1-page/learn";
import { getActor } from "@/src/4-entity/account";
import { getPost, mayRead } from "@/src/4-entity/post/server";
import { getDb, schema } from "@/src/5-shared/db";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ postId: string }> }) {
  const actor = await getActor();
  const post = await getPost((await params).postId);
  if (!post || !mayRead(post, actor)) notFound();
  const progress = actor ? await getDb().query.learningProgress.findFirst({ where: and(eq(schema.learningProgress.userId, actor.id), eq(schema.learningProgress.postId, post.id)) }) : null;
  return <Learn post={{ id: post.id, slug: post.slug, title: post.title, contentJson: JSON.parse(post.contentJson) }} signedIn={Boolean(actor)} initialStatus={progress?.status ?? null} />;
}
