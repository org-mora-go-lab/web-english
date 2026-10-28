import { notFound } from "next/navigation";

import { AdminUsers } from "@/src/1-page/admin-users";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";
export default async function Page() { if ((await getActor())?.role !== "admin") notFound(); return <AdminUsers />; }
