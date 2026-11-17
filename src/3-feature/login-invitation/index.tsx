import Image from "next/image";
import Link from "next/link";

import type { LoginInvitationProps } from "./type";

export function LoginInvitation({ returnTo = "/" }: LoginInvitationProps) {
  return <main className="login-invitation" aria-labelledby="login-invitation-title">
    <Link href="/" className="login-invitation-brand" aria-label="Mora Little English 홈"><span>m.</span>mora <b>little english</b></Link>
    <section className="login-invitation-content">
      <div className="login-invitation-art"><Image src="/media/singalong/characters/kitten.png" alt="반갑게 인사하는 주황색 아기 고양이" width={260} height={260} priority /><span aria-hidden="true">Hi, friend!</span></div>
      <p className="login-invitation-eyebrow">작은 놀이, 함께하는 영어</p>
      <h1 id="login-invitation-title">로그인하고<br />영어 놀이를 시작해요</h1>
      <p className="login-invitation-description">아이에게 맞는 놀이를 고르고,<br />고양이 친구와 영어로 이야기해 보세요.</p>
      <Link className="login-invitation-primary" href={`/login?callbackUrl=${encodeURIComponent(returnTo)}`}>로그인하고 대화하기 <span aria-hidden="true">→</span></Link>
      <Link className="login-invitation-signup" href="/signup">처음이신가요? <strong>회원가입</strong></Link>
    </section>
    <p className="login-invitation-note">부모님과 아이가 함께하는 공간이에요.</p>
  </main>;
}
