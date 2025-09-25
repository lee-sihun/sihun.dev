"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import Square from "../public/svg/logo.svg";

export default function ThemeSwitcher() {
  const { systemTheme, theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const safeTheme = resolvedTheme ?? "light";
  const isDark = safeTheme === "dark";

  if (!mounted) {
    return null;
  }

  return (
    <button
      type="button"
      className="relative w-8 h-8 cursor-pointer"
      onClick={() => {
        setTheme(isDark ? "light" : "dark");
      }}
    >
      {/* <div
        className={`w-8 h-8 rounded-[10px] bg-black dark:bg-white transition-colors duration-300 ease-in-out`}
      /> */}
      <Square className="fill-[#171717] dark:fill-[#fafafa] transition-colors duration-300 ease-in-out" />
      <div className="absolute top-1/2 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 bg-[#fafafa] dark:bg-[#171717]" />
      <div className="absolute top-1/2 left-1/2 w-[18px] h-[18px] rounded-full transform -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-colors duration-300 ease-in-out bg-[#fafafa] dark:bg-[#171717]">
        <motion.div
          initial={false}
          animate={{ rotate: isDark ? -180 : 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 26 }}
          className="h-full w-full"
          style={{ transformOrigin: "50% 50%" }}
        >
          <div
            className="h-full w-full rounded-full bg-[#171717] dark:bg-[#fafafa] transition-colors duration-300 ease-in-out"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
          />
        </motion.div>
      </div>
      <span className="border-0 clip-[0_0_0_0] h-px -mt-px overflow-hidden p-0 absolute whitespace-nowrap w-px">
        Theme Switch
      </span>
    </button>
  );
}
