import { redirect } from "next/navigation";

import { Studio } from "@/src/1-page/studio";
import { getActor } from "@/src/4-entity/account";
import { listPosts } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=%2Fstudio");
  return <Studio displayName={actor.displayName} profileImageUrl={actor.profileImageUrl} posts={await listPosts("mine", actor)} />;
}
