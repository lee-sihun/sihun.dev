"use client";
import { useTheme } from "next-themes";
import Square from "../public/svg/logo.svg";

export default function ThemeSwitcher() {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      className="relative w-8 h-8 cursor-pointer"
      onClick={() => {
        setTheme(currentTheme === "dark" ? "light" : "dark");
      }}
    >
      {/* <div
        className={`w-8 h-8 rounded-[10px] bg-black dark:bg-white transition-colors duration-300 ease-in-out`}
      /> */}
      <Square className="fill-[#171717] dark:fill-white transition-colors duration-300 ease-in-out" />
      <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#171717]" />
      <div className="dark:rotate-[-180deg] rotate-[0deg] absolute top-1/2 left-1/2 w-[18px] h-[18px] rounded-full transform -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-transform duration-300 ease-in-out bg-white dark:bg-[#171717]">
        <div
          className="w-[18px] h-[18px] rounded-full bg-[#171717] dark:bg-white"
          style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
        />
      </div>
    </button>
  );
}
