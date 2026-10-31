import { LearningWorkspace } from "@/src/2-widget";

import type { HomeProps } from "./type";

export function Home({ viewer }: HomeProps) {
  return (
    <div className="home">
      <LearningWorkspace viewer={viewer} />
    </div>
  );
}
