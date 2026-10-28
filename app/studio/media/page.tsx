import { redirect } from "next/navigation";

import { MediaManager } from "@/src/1-page/media-manager";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";
export default async function Page() { if (!(await getActor())) redirect("/login?callbackUrl=%2Fstudio%2Fmedia"); return <MediaManager />; }
