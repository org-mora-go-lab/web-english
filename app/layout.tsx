import "@/src/3-feature/play-chat-card/index.scss";
import "@/src/3-feature/login-invitation/index.scss";
import "@/src/3-feature/ai-chat/index.scss";
import "@/src/5-shared/style/global.scss";
import "@/src/5-shared/style/tailwind.css";
import "@/src/1-page/home/index.scss";
import "@/src/1-page/family-hub/index.scss";
import "@/src/1-page/watch/index.scss";
import "@/src/1-page/account/index.scss";
import "@/src/1-page/account-settings/index.scss";
import "@/src/1-page/post-list/index.scss";
import "@/src/1-page/post-detail/index.scss";
import "@/src/1-page/learning-context/index.scss";
import "@/src/1-page/learn/index.scss";
import "@/src/1-page/learning-progress/index.scss";
import "@/src/1-page/admin-users/index.scss";
import "@/src/1-page/admin-posts/index.scss";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mora Little English · 아이와 함께하는 영어 놀이",
  description:
    "16~36개월 아이의 영어 놀이 커리큘럼과 가족의 놀이 기록, 부모 가이드.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: "try{document.documentElement.dataset.theme=localStorage.getItem('mora-english-theme')==='dark'?'dark':'light'}catch{}" }} /></head>
      <body>{children}</body>
    </html>
  );
}
