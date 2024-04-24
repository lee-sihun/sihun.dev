"use client";
import { useTheme } from "next-themes";
import Square from "../public/svg/square.svg";

export default function ThemeSwitcher() {
  const { systemTheme, theme, setTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <div
      className="relative w-8 h-8"
      onClick={() => {
        setTheme(currentTheme === "dark" ? "light" : "dark");
      }}
    >
      {/* <div
        className={`w-8 h-8 rounded-[10px] bg-black dark:bg-white transition-colors duration-300 ease-in-out`}
      /> */}
      <Square className="fill-black dark:fill-white transition-colors duration-300 ease-in-out" />
      <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-black" />
      <div
        className={`absolute top-1/2 left-1/2 w-[18px] h-[18px] rounded-full transform -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-transform duration-300 ease-in-out ${
          currentTheme === "dark" ? "rotate-[-180deg]" : "rotate-[0deg]"
        } bg-white dark:bg-black`}
      >
        <div
          className="w-[18px] h-[18px] rounded-full bg-black dark:bg-white"
          style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
        />
      </div>
    </div>
  );
}
