"use client";
import Link from "next/link";
import LogoSvg from "../public/svg/logo.svg";
import { usePathname } from "next/navigation";

const nav: { title: string; location: string }[] = [
  { title: "블로그", location: "/blog" },
  { title: "포트폴리오", location: "/portfolio" },
  { title: "소개", location: "/about" },
];

export default function Nav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center">
      <Link className="flex items-center" href="/">
        <LogoSvg className="fill-black dark:fill-white" />
        <div className="text-lg font-bold ml-[5px]">인터넷 탐험가</div>
      </Link>
      {nav.map((item) => {
        const { title, location } = item;
        const isActive = pathname === location; //경로가 일치하는지 체크
        return (
          <Link href={location} key={title}>
            <div
              className={`text-base ml-[30px] ${isActive ? "font-bold" : ""}`}
            >
              {title}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
