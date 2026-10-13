"use client";
import { usePathname } from "next/navigation";

// 헤더·푸터 없이 화면 전체를 쓰는 페이지
const IMMERSIVE_PATHS = ["/home"];

export default function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  if (IMMERSIVE_PATHS.includes(pathname)) return null;
  return <>{children}</>;
}
