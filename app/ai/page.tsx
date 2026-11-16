import "@/src/1-page/ai-coach/index.scss";

import type { Metadata } from "next";

import { AiCoach } from "@/src/1-page/ai-coach";
import { getActor } from "@/src/4-entity/account";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI 영어 도우미 · Mora Little English",
  description: "부모의 영어 한마디와 놀이 준비를 돕는 AI 영어 도우미",
};

export default async function Page() {
  const actor = await getActor();

  return <AiCoach viewer={actor ? { displayName: actor.displayName, profileImageUrl: actor.profileImageUrl } : null} />;
}
