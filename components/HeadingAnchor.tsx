"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";
import CopySvg from "../public/svg/copy.svg";
import CheckSvg from "../public/svg/check.svg";

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingAnchorProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as: HeadingTag;
}

const copyFallback = (text: string) => {
  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.opacity = "0";

  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
};

export function HeadingAnchor({
  as,
  children,
  className,
  id,
  ...props
}: HeadingAnchorProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Tag = as;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const finalizeCopy = () => {
    setCopied(true);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  const copyLinkToClipboard = async () => {
    if (typeof window === "undefined" || !id) return;

    const { origin, pathname } = window.location;
    const url = `${origin}${pathname}#${id}`;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        copyFallback(url);
      }
    } catch (error) {
      copyFallback(url);
    }

    finalizeCopy();
  };

  const handleHeadingClick = (event: MouseEvent<HTMLHeadingElement>) => {
    if (typeof window === "undefined") return;

    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      return;
    }

    copyLinkToClipboard();
  };

  const combinedClassName = [
    "group relative cursor-pointer pr-16 lg:pr-20 scroll-mt-28 transition-colors duration-200 hover:text-[#111827] dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0C0C0C]",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      id={id}
      {...props}
      className={combinedClassName}
      onClick={handleHeadingClick}
    >
      <span className="block">{children}</span>
      {id && (
        <button
          type="button"
          className={`absolute right-0 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 rounded-full border border-[#E5E5E5] dark:border-[#2F2F2F] bg-white/80 dark:bg-[#111111]/80 px-2.5 py-1 text-xs font-medium text-[#52525B] dark:text-[#D4D4D8] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 ${
            copied ? "opacity-100" : ""
          } shadow-[0_10px_24px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_32px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-opacity backdrop-saturate-150`}
          onClick={(event) => {
            event.stopPropagation();
            copyLinkToClipboard();
          }}
          aria-label={copied ? "섹션 링크가 복사되었습니다." : "섹션 링크 복사"}
        >
          {copied ? (
            <>
              <CheckSvg className="h-4 w-4 text-[#22C55E]" />
              <span className="hidden sm:inline">복사됨</span>
            </>
          ) : (
            <>
              <CopySvg className="h-4 w-4 text-[#9CA3AF] dark:text-[#D4D4D8]" />
              <span className="hidden sm:inline">링크 복사</span>
            </>
          )}
        </button>
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "섹션 링크가 복사되었습니다." : ""}
      </span>
    </Tag>
  );
}

export default HeadingAnchor;
