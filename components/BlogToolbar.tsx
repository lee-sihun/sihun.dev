"use client";
import { useEffect, useRef, useState } from "react";
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
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const toolbarInnerRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const DOCK_SPACING = 24;

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

  useEffect(() => {
    if (!isMounted) return;

    const handleScrollVisibility = () => {
      setIsToolbarVisible(window.scrollY > 20);
    };

    handleScrollVisibility();
    window.addEventListener("scroll", handleScrollVisibility, {
      passive: true,
    });

    return () => window.removeEventListener("scroll", handleScrollVisibility);
  }, [isMounted]);

  useEffect(() => {
    if (!isMounted) return;

    const measureToolbar = () => {
      const nextHeight = toolbarInnerRef.current?.offsetHeight ?? 0;
      setToolbarHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    };

    measureToolbar();
    window.addEventListener("resize", measureToolbar);

    return () => window.removeEventListener("resize", measureToolbar);
  }, [isMounted, isTocOpen]);

  useEffect(() => {
    if (!isMounted) return;

    const computeDocking = () => {
      const contentEl = document.querySelector<HTMLElement>("[data-content]");
      if (!contentEl) return;

      const commentsEl = document.querySelector<HTMLElement>("[data-comments]");
      const triggerTop =
        commentsEl?.getBoundingClientRect().top ??
        contentEl.getBoundingClientRect().bottom;
      const buffer = (toolbarHeight || 0) + DOCK_SPACING;
      const threshold = window.innerHeight - buffer;
      const shouldDock = triggerTop <= threshold;

      setIsDocked((prev) => (prev === shouldDock ? prev : shouldDock));
    };

    computeDocking();
    window.addEventListener("scroll", computeDocking, { passive: true });
    window.addEventListener("resize", computeDocking);

    return () => {
      window.removeEventListener("scroll", computeDocking);
      window.removeEventListener("resize", computeDocking);
    };
  }, [isMounted, toolbarHeight, DOCK_SPACING]);

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

  const toolbarClassName = [
    "flex items-center gap-3 rounded-full px-4 bg-white/50 dark:bg-black/25 shadow-glass dark:shadow-glassDark backdrop-blur border border-white/20 dark:border-black/20",
  ].join(" ");

  return (
    <>
      {!isTocOpen && (
        <div
          className={[
            "z-[5] flex justify-center px-4 transform-gpu transition-all duration-300 ease-out",
            isDocked
              ? "relative mt-8"
              : "fixed inset-x-0 bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))]",
            isToolbarVisible
              ? "translate-y-0 opacity-100"
              : "pointer-events-none translate-y-full opacity-0",
          ].join(" ")}
        >
          <div ref={toolbarInnerRef} className={toolbarClassName}>
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
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 -translate-y-4 rounded-lg bg-white/50 dark:bg-black/25 backdrop-blur border border-white/20 dark:border-black/20 px-3 py-1 text-sm text-gray-900 dark:text-white shadow-glass dark:shadow-glassDark flex items-center gap-2">
              <CheckSvg className="w-4 h-4 text-green-500 mt-[3.5px]" />
              링크가 복사되었습니다
            </div>
          )}
        </div>
      )}

      {!isTocOpen && !isDocked && isToolbarVisible && toolbarHeight > 0 && (
        <div
          aria-hidden
          className="w-full"
          style={{ height: toolbarHeight, transition: "height 200ms ease" }}
        />
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
