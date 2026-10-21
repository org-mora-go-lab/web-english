import "@/src/5-shared/style/global.scss";
import "@/src/1-page/home/index.scss";
import "@/src/1-page/watch/index.scss";

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
