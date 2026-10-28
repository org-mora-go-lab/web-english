import { redirect } from "next/navigation";

import { PostEditor } from "@/src/1-page/post-editor";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await getActor())) redirect("/login?callbackUrl=%2Fstudio%2Fposts%2Fnew");
  return <PostEditor />;
}
