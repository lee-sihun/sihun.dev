"use client";
import Nav from "./Nav";
import ThemeSwitcher from "./ThemeSwitcher";
import CommandMenu from "@/components/CommandMenu";
import SearchSvg from "../public/svg/search.svg";
import { useState } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="flex justify-center">
      <div className="w-[1068px] h-[60px] flex justify-between items-center px-6">
        <Nav />
        <div className="flex items-center">
          <button
            className="group hidden cursor-text md:flex items-center w-[250px] h-[40px] bg-[#E5E5E5] dark:bg-[#262626] rounded-xl text-[#737373] dark:text-[#808080] text-left px-4 mr-[10px]"
            onClick={() => setOpen(true)}
          >
            <SearchSvg className="cursor-pointer w-[18px] h-[18px] mr-2" />
            <span className="flex-grow">Search...</span>
            <span className="group-hover:text-black group-hover:dark:text-white flex items-center justify-center bg-[#FAFAFA] dark:bg-[#171717] rounded-[3px] w-[35px] h-[20px]">
              ⌘K
            </span>
          </button>
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
