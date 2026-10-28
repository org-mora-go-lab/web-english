import { notFound, redirect } from "next/navigation";

import { PostEditor } from "@/src/1-page/post-editor";
import { getActor } from "@/src/4-entity/account";
import { getPost, getPostDetails, mayEdit } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=%2Fstudio");
  const post = await getPost((await params).id);
  if (!post || !mayEdit(post, actor)) notFound();
  return <PostEditor initial={await getPostDetails(post)} />;
}
