"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AiChat, LoginInvitation } from "@/src/3-feature";
import { useViewportHeight } from "@/src/5-shared";

import type { AiCoachProps } from "./type";

export function AiCoach({ viewer }: AiCoachProps) {
  const viewportHeight = useViewportHeight();
  const [chatTitle, setChatTitle] = useState("새 채팅");
  if (!viewer) return <LoginInvitation returnTo="/ai" />;
  return (
    <div className="ai-coach" style={{ height: viewportHeight }}>
      <a className="ai-coach-skip" href="#ai-chat">대화로 건너뛰기</a>
      <header className="ai-coach-header"><span className="ai-coach-title" title={chatTitle}>{chatTitle}</span><Link href="/" aria-label="콘텐츠" title="콘텐츠"><BookOpen size={20} aria-hidden="true" /></Link></header>
      <main className="ai-coach-main" aria-label="영어 대화">
        <AiChat signedIn embedded onTitleChange={setChatTitle} />
      </main>
    </div>
  );
}
