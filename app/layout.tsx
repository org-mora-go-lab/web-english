import "@/src/5-shared/style/global.scss";
import "@/src/5-shared/style/tailwind.css";
import "@/src/1-page/home/index.scss";
import "@/src/1-page/watch/index.scss";
import "@/src/1-page/account/index.scss";
import "@/src/1-page/account-settings/index.scss";
import "@/src/1-page/post-list/index.scss";
import "@/src/1-page/post-detail/index.scss";
import "@/src/1-page/post-editor/index.scss";
import "@/src/1-page/studio/index.scss";
import "@/src/1-page/post-import/index.scss";
import "@/src/1-page/media-manager/index.scss";
import "@/src/1-page/learning-context/index.scss";
import "@/src/1-page/learn/index.scss";
import "@/src/1-page/learning-progress/index.scss";
import "@/src/1-page/admin-users/index.scss";
import "@/src/1-page/admin-posts/index.scss";

import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Mora English · A little English, every day",
  description:
    "나의 일상에 영어를 더하는 공간. 짧은 영어 레슨을 탐색하고, 듣고, 저장하세요.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
