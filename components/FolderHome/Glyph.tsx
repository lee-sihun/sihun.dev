import type { SVGProps } from "react";
import BlogSvg from "@/public/svg/blog.svg";

function SettingsSvg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        d="M4 6.5h16M4 12h16M4 17.5h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.4"
      />
      <circle cx="9" cy="6.5" r="2.4" fill="currentColor" />
      <circle cx="15.5" cy="12" r="2.4" fill="currentColor" />
      <circle cx="7" cy="17.5" r="2.4" fill="currentColor" />
    </svg>
  );
}

/** 이미지가 없는 카드(글, 설정)의 아이콘 */
export default function Glyph({ kind }: { kind: "writing" | "settings" }) {
  return kind === "settings" ? (
    <SettingsSvg aria-hidden />
  ) : (
    <BlogSvg aria-hidden />
  );
}
