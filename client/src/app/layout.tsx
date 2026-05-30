import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PIXODUS — 동물농장 탈출",
  description: "조지 오웰의 동물농장을 바탕으로 한 탑다운 로그라이크 슈터",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
