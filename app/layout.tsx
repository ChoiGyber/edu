import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "안전교육 플랫폼 | Safety Education Platform",
  description: "건설 안전교육을 위한 올인원 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://safetyabc.co.kr/library/fonts/Pretendard-1.3.9/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="antialiased font-pretendard">{children}</body>
    </html>
  );
}
