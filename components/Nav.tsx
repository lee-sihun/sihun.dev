"use client";
import Link from "next/link";
import LogoSvg from "../public/svg/logo.svg";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const nav: { title: string; location: string }[] = [
  { title: "홈", location: "/" },
  { title: "블로그", location: "/blog" },
  { title: "포트폴리오", location: "/portfolio" },
  { title: "소개", location: "/about" },
];

export default function Nav() {
  const [onToggle, setOnToggle] = useState(false);
  const pathname = usePathname();

  const handleToggle = () => {
    setOnToggle(!onToggle);
  };

  //스크롤 활성/비활성화
  useEffect(() => {
    document.body.style.overflow = onToggle ? "hidden" : "visible";
  }, [onToggle]);

  //경로 이동 시 토글 닫기 (깜빡임 방지)
  useEffect(() => {
    setOnToggle(false);
  }, [pathname]);

  return (
    <div className="flex items-center">
      <Link className="hidden md:flex items-center" href="/">
        <LogoSvg className="fill-black dark:fill-white" />
        <div className="text-lg font-bold ml-[5px]">인터넷 탐험가</div>
      </Link>
      <div
        className="flex md:hidden items-center cursor-pointer"
        onClick={handleToggle}
      >
        <LogoSvg className="fill-black dark:fill-white" />
        <div className="text-lg font-bold ml-[5px]">인터넷 탐험가</div>
      </div>
      <div className="hidden md:flex items-center">
        {nav.slice(1).map((item) => {
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
      <div
        className={`w-full h-screen absolute top-[60px] left-0 bg-white flex-col flex-nowrap px-6 dark:bg-[#121212] md:hidden ${
          onToggle ? "" : "hidden"
        }`}
      >
        {nav.map((item) => {
          const { title, location } = item;
          const isActive = pathname === location; //경로가 일치하는지 체크
          return (
            <Link href={location} key={title}>
              <div
                className={`cursor-pointer py-4 border-solid border-b border-neutral-200 dark:border-neutral-700 text-base ${
                  isActive ? "font-bold" : ""
                }`}
              >
                {title}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
