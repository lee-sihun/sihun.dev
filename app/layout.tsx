import type { Metadata } from "next";
import "./globals.css";
import "../styles/reset.css";
import localFont from "next/font/local";
import Header from "@/components/Header";
import Providers from "@/components/Provider";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://sihun.dev"),
  title: {
    default: "시훈의 개발노트",
    template: "%s | 시훈의 개발노트",
  },
  description: "프론트엔드 개발자 시훈의 기술 블로그입니다.",
  openGraph: {
    title: "시훈의 개발노트",
    description: "프론트엔드 개발자 시훈의 기술 블로그입니다.",
    type: "website",
    siteName: "시훈의 개발노트",
    url: "https://sihun.dev",
    locale: "ko_KR",
    images: [
      {
        url: "/img/logo.jpg",
        width: 800,
        height: 600,
        alt: "site logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "시훈의 개발노트",
    description: "프론트엔드 개발자 시훈의 기술 블로그입니다.",
    images: [
      {
        url: "/img/logo.jpg",
        alt: "site logo",
      },
    ],
  },
};

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning={true}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "시훈의 개발노트",
              url: "https://sihun.dev",
            }),
          }}
        />
      </head>
      <body className={pretendard.className}>
        <Providers>
          <Header />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
