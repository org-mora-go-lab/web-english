import { redirect } from "next/navigation";

import { PostImport } from "@/src/1-page/post-import";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";
export default async function Page() { if (!(await getActor())) redirect("/login?callbackUrl=%2Fstudio%2Fimport"); return <PostImport />; }
