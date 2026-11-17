import { PostList } from "@/src/1-page/post-list";
import { LoginInvitation } from "@/src/3-feature";
import { getActor } from "@/src/4-entity/account";
import { listPosts } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page() {
  if (!await getActor()) return <LoginInvitation returnTo="/posts" />;
  return <PostList posts={await listPosts("public", null)} />;
}
