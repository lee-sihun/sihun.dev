"use client";
import { useState } from "react";
import CopySvg from "../public/svg/copy.svg";
import CheckSvg from "../public/svg/check.svg";

interface CopyButtonProps {
  preRef: React.RefObject<HTMLPreElement>;
  isHoverd: boolean;
}

export const CopyButton = ({ preRef, isHoverd }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyText = async () => {
    const text = preRef.current?.innerText;
    await navigator.clipboard.writeText(text ?? "");
    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <button
      disabled={isCopied}
      onClick={handleCopyText}
      className={`hover:bg-black/5 dark:hover:bg-white/10 w-[38px] h-[38px] rounded-md p-2 justify-center items-center ${
        isHoverd ? "flex" : "hidden"
      }`}
    >
      {isCopied ? (
        <CheckSvg className="fill-green-600" />
      ) : (
        <CopySvg className="fill-[#7F848E]" />
      )}
    </button>
  );
};
