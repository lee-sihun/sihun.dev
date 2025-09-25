"use client";
import { useEffect, useState } from "react";
import Toc, { TocHeading } from "@/components/Toc";
import TocSvg from "../public/svg/list.svg";
import CommentSvg from "../public/svg/comment.svg";
import CopySvg from "../public/svg/share.svg";
import CheckSvg from "../public/svg/check.svg";

interface BlogToolbarProps {
  headings?: TocHeading[];
  title?: string;
}

export default function BlogToolbar({ headings, title }: BlogToolbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isCopied) return;

    const timeout = window.setTimeout(() => {
      setIsCopied(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [isCopied]);

  if (!isMounted) return null;

  const handleToggleToc = () => {
    setIsTocOpen((prev) => !prev);
  };

  const handleCloseToc = () => {
    setIsTocOpen(false);
  };

  const handleScrollToComments = () => {
    const commentsSection = document.querySelector("[data-comments]");
    if (commentsSection instanceof HTMLElement) {
      commentsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy URL", error);
    }
  };

  return (
    <>
      {!isTocOpen && (
        <div className="fixed inset-x-0 bottom-0 z-[5] flex justify-center pb-[calc(1rem+env(safe-area-inset-bottom))] px-4">
          <div className="flex items-center gap-3 rounded-full px-4 bg-white/50 dark:bg-black/25 shadow-glass dark:shadow-glassDark backdrop-blur border border-white/20 dark:border-black/20">
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
              onClick={handleToggleToc}
              aria-label="Toggle table of contents"
            >
              <TocSvg className="h-6 w-6" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
              onClick={handleScrollToComments}
              aria-label="Scroll to comments"
            >
              <CommentSvg className="h-6 w-6" />
            </button>
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-600"></div>
            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
              onClick={handleCopyUrl}
              aria-label="Copy article URL"
            >
              <CopySvg className="h-6 w-6" />
            </button>
          </div>
          {isCopied && (
            <div className="absolute bottom-[80px] left-1/2 -translate-x-1/2 rounded-lg bg-white/50 dark:bg-black/25 backdrop-blur border border-white/20 dark:border-black/20 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-glass dark:shadow-glassDark flex items-center gap-2">
              <CheckSvg className="w-4 h-4 text-green-500 mt-[3.5px]" />
              링크가 복사되었습니다
            </div>
          )}
        </div>
      )}

      {isTocOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={handleCloseToc}
        >
          <div
            className="max-w-[640px] w-[min(90%,640px)] rounded-2xl border border-solid border-[#E4E4E7] bg-white/90 p-6 shadow-2xl outline-none dark:border-[#2F2F37] dark:bg-[#171717]/90"
            onClick={(event) => event.stopPropagation()}
          >
            <Toc
              headings={headings ?? []}
              title={title}
              variant="plain"
              showHeader={false}
              className="space-y-1"
              listClassName="max-h-[60vh] space-y-1 overflow-auto pr-2 hidden-scrollbar"
            />
          </div>
        </div>
      )}
    </>
  );
}
