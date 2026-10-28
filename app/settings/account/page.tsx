import { redirect } from "next/navigation";

import { AccountSettings } from "@/src/1-page/account-settings";
import { getActor } from "@/src/4-entity/account";

export default async function Page() {
  const actor = await getActor();
  if (!actor) redirect("/login?callbackUrl=%2Fsettings%2Faccount");
  return <AccountSettings email={actor.email} displayName={actor.displayName} />;
}
