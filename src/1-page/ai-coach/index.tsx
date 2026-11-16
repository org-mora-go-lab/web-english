import { ArrowLeft, ArrowUpRight, Leaf, MessageCircle } from "lucide-react";
import Link from "next/link";

import { AiChat } from "@/src/3-feature";
import { AccountIdentity } from "@/src/4-entity/account/client";

import type { AiCoachProps } from "./type";

export function AiCoach({ viewer }: AiCoachProps) {
  return (
    <div className="ai-coach">
      <a className="ai-coach-skip" href="#ai-chat">대화로 건너뛰기</a>
      <header className="ai-coach-header">
        <Link href="/" className="ai-coach-brand" aria-label="Mora Little English 홈">
          <span className="ai-coach-brand-mark">m.</span>
          <span>mora <b>little english</b></span>
        </Link>
        <nav aria-label="AI 도우미 메뉴">
          <Link href="/" className="ai-coach-home"><ArrowLeft size={15} aria-hidden="true" />오늘의 놀이</Link>
          {viewer ? <Link href="/settings/account" aria-label={`${viewer.displayName} 계정 설정`}><AccountIdentity displayName={viewer.displayName} profileImageUrl={viewer.profileImageUrl} compact /></Link> : <Link href="/login?callbackUrl=/ai" className="ai-coach-login">부모 로그인</Link>}
        </nav>
      </header>

      <main className="ai-coach-main">
        <section className="ai-coach-intro" aria-labelledby="ai-coach-title">
          <div>
            <span className="ai-coach-eyebrow"><Leaf size={14} aria-hidden="true" />A LITTLE HELP FOR PARENTS</span>
            <h1 id="ai-coach-title">영어 한마디가<br /><em>떠오르지 않을 때.</em></h1>
            <p>오늘의 놀이에 어울리는 영어를 찾고,<br className="ai-coach-desktop-break" /> 부모의 속도로 가볍게 연습해 보세요.</p>
          </div>
          <div className="ai-coach-note">
            <span className="ai-coach-note-icon"><MessageCircle size={23} strokeWidth={1.5} aria-hidden="true" /></span>
            <strong>부모가 먼저 준비하는 공간</strong>
            <p>답변을 읽은 뒤 화면을 내려놓고,<br />아이와 눈을 맞추며 말해 주세요.</p>
            <Link href="/library">영어 영상도 둘러보기 <ArrowUpRight size={14} aria-hidden="true" /></Link>
          </div>
        </section>
        {viewer ? <AiChat signedIn /> : <section className="ai-coach-gate" id="ai-chat" aria-labelledby="ai-login-title"><MessageCircle size={30} aria-hidden="true" /><h2 id="ai-login-title">로그인 후 AI를 이용해 주세요.</h2><p>부모님 계정으로 로그인하면 모델을 선택하고<br />영어 놀이와 회화를 준비할 수 있어요.</p><Link href="/login?callbackUrl=/ai">로그인하고 대화하기 <ArrowUpRight size={16} aria-hidden="true" /></Link></section>}
        <footer className="ai-coach-footer"><span>작은 한마디도 충분해요.</span><p>AI의 제안은 틀릴 수 있어요. 아이의 관심과 안전에 맞게 골라 사용해 주세요.</p></footer>
      </main>
    </div>
  );
}
