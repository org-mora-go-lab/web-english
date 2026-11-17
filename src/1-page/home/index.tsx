import { LearningWorkspace } from "@/src/2-widget";
import { LoginInvitation } from "@/src/3-feature";

import type { HomeProps } from "./type";

export function Home({ viewer }: HomeProps) {
  if (!viewer) return <LoginInvitation returnTo="/library" />;
  return (
    <div className="home">
      <LearningWorkspace viewer={viewer} />
    </div>
  );
}
