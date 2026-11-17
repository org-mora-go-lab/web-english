"use client";

import Link from "next/link";

import { AiChat, LoginInvitation } from "@/src/3-feature";
import { useViewportHeight } from "@/src/5-shared";

import type { AiCoachProps } from "./type";

export function AiCoach({ viewer }: AiCoachProps) {
  const viewportHeight = useViewportHeight();
  if (!viewer) return <LoginInvitation returnTo="/ai" />;
  return (
    <div className="ai-coach" style={{ height: viewportHeight }}>
      <a className="ai-coach-skip" href="#ai-chat">대화로 건너뛰기</a>
      <header className="ai-coach-header"><span className="ai-coach-title">Mora</span><Link href="/" aria-label="오늘의 놀이로 돌아가기">콘텐츠</Link></header>
      <main className="ai-coach-main" aria-label="영어 대화">
        <AiChat signedIn embedded />
      </main>
    </div>
  );
}
