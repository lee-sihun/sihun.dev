"use client";
import { useState, useEffect } from "react";
import CopySvg from "../public/svg/copy.svg";
import CheckSvg from "../public/svg/check.svg";

interface CopyButtonProps {
  preRef: React.RefObject<HTMLPreElement>;
  isHoverd: boolean;
}

export const CopyButton = ({ preRef, isHoverd }: CopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (isHoverd) {
      setVisible(true);
    } else {
      timeoutId = setTimeout(() => {
        setVisible(false);
      }, 1500); // 3초 후에 버튼을 숨기기
    }
    return () => clearTimeout(timeoutId); // 컴포넌트가 언마운트되거나 상태가 변경되면 타이머를 취소
  }, [isHoverd]);

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
        visible ? "flex" : "hidden"
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
