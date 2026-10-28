import { notFound } from "next/navigation";

import { AdminPosts } from "@/src/1-page/admin-posts";
import { getActor } from "@/src/4-entity/account";
import { listPosts } from "@/src/4-entity/post/server";

export const dynamic = "force-dynamic";
export default async function Page() {
  const actor = await getActor();
  if (actor?.role !== "admin") notFound();
  return <AdminPosts posts={await listPosts("all", actor)} />;
}
