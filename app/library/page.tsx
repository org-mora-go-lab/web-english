import { Home } from "@/src/1-page/home";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";

export default async function Page() {
  const actor = await getActor();
  return <Home viewer={actor ? { displayName: actor.displayName, profileImageUrl: actor.profileImageUrl } : null} />;
}
