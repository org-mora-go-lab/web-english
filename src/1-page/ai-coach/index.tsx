"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { AiChat, LoginInvitation } from "@/src/3-feature";
import { AccountIdentity } from "@/src/4-entity/account/client";
import { useViewportHeight } from "@/src/5-shared";

import type { AiCoachProps } from "./type";

export function AiCoach({ viewer }: AiCoachProps) {
  const viewportHeight = useViewportHeight();
  if (!viewer) return <LoginInvitation returnTo="/ai" />;
  return (
    <div className="ai-coach" style={{ height: viewportHeight }}>
      <a className="ai-coach-skip" href="#ai-chat">대화로 건너뛰기</a>
      <header className="ai-coach-header">
        <Link href="/" className="ai-coach-home" aria-label="오늘의 놀이로 돌아가기"><ArrowLeft size={20} aria-hidden="true" /></Link>
        <Link href="/" className="ai-coach-brand" aria-label="Mora Little English 홈">Mora English</Link>
        <Link href="/settings/account" className="ai-coach-account" aria-label={`${viewer.displayName} 계정 설정`}><AccountIdentity displayName={viewer.displayName} profileImageUrl={viewer.profileImageUrl} compact /></Link>
      </header>
      <main className="ai-coach-main" aria-label="영어 대화">
        <AiChat signedIn embedded />
      </main>
    </div>
  );
}
