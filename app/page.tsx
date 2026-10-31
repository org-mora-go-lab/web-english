import { FamilyHub } from "@/src/1-page/family-hub";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";

export default async function Page() {
  const actor = await getActor();
  return <FamilyHub viewer={actor ? { displayName: actor.displayName, profileImageUrl: actor.profileImageUrl } : null} />;
}
