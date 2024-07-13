"use client";
import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Squircle } from "@/components/Squircle";

interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof children === "string") {
      router.push(`/blog/tag/${children}`);
    }
  };

  return (
    <Squircle
      cornerRadius={10}
      cornerSmoothing={0.6}
      onClick={handleClick}
      className="cursor-pointer transition-colors h-8 mt-2.5 mr-2 bg-[#EDEDED] dark:bg-[#262626] hover:bg-[#E5E5E5] dark:hover:bg-[#363636] w-auto inline-flex flex-wrap justify-center items-center"
    >
      <div className="font-normal text-base mx-2 text-[#404040] dark:text-[#B5B5B5] hover:text-[#171717] dark:hover:text-[#E5E5E5]">
        {children}
      </div>
    </Squircle>
  );
}
