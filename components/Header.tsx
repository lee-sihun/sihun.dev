"use client";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
// import CommandMenu from "@/components/CommandMenu";
import SearchSvg from "../public/svg/search.svg";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Squircle } from "@/components/Squircle";

const CommandMenu = dynamic(() => import("@/components/CommandMenu"));

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex justify-center">
      <div className="w-[1068px] h-[60px] flex justify-between items-center px-6">
        <Nav />
        <div className="flex items-center">
          <Squircle
            cornerRadius={12}
            cornerSmoothing={0.6}
            className="group hidden cursor-text md:flex items-center w-[250px] h-[40px] bg-[#E5E5E5] dark:bg-[#262626] text-[#737373] dark:text-[#808080] text-left px-4 mr-[10px]"
            onClick={() => setOpen(true)}
          >
            <SearchSvg className="cursor-pointer w-[18px] h-[18px] mr-2" />
            <span className="flex-grow">Search...</span>
            <Squircle
              cornerRadius={3}
              cornerSmoothing={0.6}
              className="group-hover:text-black group-hover:dark:text-white flex items-center justify-center bg-[#FAFAFA] dark:bg-[#171717] w-[35px] h-[20px]"
            >
              ⌘K
            </Squircle>
          </Squircle>
          <ThemeSwitcher />
        </div>
        <button
          className={`${
            open ? "hidden" : ""
          } fixed md:hidden bottom-4 right-4 w-12 h-12 text-xl text-black dark:text-white rounded-full flex items-center justify-center z-50 bg-white/50 dark:bg-black/25 shadow-glass dark:shadow-glassDark backdrop-blur border border-white/20 dark:border-black/20`}
          onClick={() => setOpen(true)}
        >
          ⌘
        </button>
        <CommandMenu open={open} setOpen={setOpen} />
      </div>
    </header>
  );
}
