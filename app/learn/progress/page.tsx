import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { LearningProgress } from "@/src/1-page/learning-progress";
import { getActor } from "@/src/4-entity/account";
import { getDb, schema } from "@/src/5-shared/db";

export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=%2Flearn%2Fprogress");
  const rows = await getDb().select({ postId: schema.learningProgress.postId, status: schema.learningProgress.status, updatedAt: schema.learningProgress.updatedAt, title: schema.posts.title, slug: schema.posts.slug }).from(schema.learningProgress).innerJoin(schema.posts, eq(schema.learningProgress.postId, schema.posts.id)).where(eq(schema.learningProgress.userId, actor.id));
  return <LearningProgress items={rows} />;
}
