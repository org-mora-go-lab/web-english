import { PostList } from "@/src/1-page/post-list";
import { listPosts } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page() { return <PostList posts={await listPosts("public", null)} />; }
