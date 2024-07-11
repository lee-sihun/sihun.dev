"use client"
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface TagProps {
  children: ReactNode;
}

export default function Tag({ children }: TagProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof children === 'string') {
      router.push(`/blog/tag/${children}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="cursor-pointer h-8 mt-2.5 mr-2 bg-[#EDEDED] dark:bg-[#262626] rounded-[10px] w-auto inline-flex flex-wrap justify-center items-center"
    >
      <div className="font-normal text-base mx-2 text-[#404040] dark:text-[#B5B5B5]">
        {children}
      </div>
    </div>
  );
}
