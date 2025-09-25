"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toc, { TocHeading } from "@/components/Toc";
import TocSvg from "../public/svg/list.svg";
import CommentSvg from "../public/svg/comment.svg";
import CopySvg from "../public/svg/share.svg";
import CheckSvg from "../public/svg/check.svg";

interface BlogToolbarProps {
  headings?: TocHeading[];
  title?: string;
}

const toolbarWrapperVariants = {
  hidden: { opacity: 1, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 200, damping: 32 },
  },
  exit: {
    opacity: 0,
    y: 60,
    transition: { duration: 0.32, ease: "easeInOut" },
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: "easeInOut" } },
};

const panelVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 240, damping: 28 },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.98,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

const copyTooltipVariants = {
  hidden: { opacity: 1, x: "-50%", y: 12 },
  visible: {
    opacity: 1,
    x: "-50%",
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: "-50%",
    y: 12,
    transition: { duration: 0.18, ease: "easeInOut" },
  },
};

export default function BlogToolbar({ headings, title }: BlogToolbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const toolbarInnerRef = useRef<HTMLDivElement>(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const DOCK_SPACING = 24;
  const DOCK_THRESHOLD_OFFSET = 16;

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
      const shouldDock = triggerTop <= threshold + DOCK_THRESHOLD_OFFSET;

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
    "relative flex items-center gap-3 rounded-full px-4 bg-white/50 dark:bg-black/25 shadow-glass dark:shadow-glassDark backdrop-blur border border-white/20 dark:border-black/20",
  ].join(" ");

  const toolbarWrapperClassName = [
    "z-[5] flex justify-center px-4 transform-gpu",
    isDocked
      ? "relative mt-8"
      : "fixed inset-x-0 bottom-0 pb-[calc(1rem+env(safe-area-inset-bottom))]",
  ].join(" ");

  return (
    <>
      <AnimatePresence>
        {!isTocOpen && (
          <motion.div
            key="toolbar"
            className={toolbarWrapperClassName}
            variants={toolbarWrapperVariants}
            initial="hidden"
            animate={isToolbarVisible ? "visible" : "hidden"}
            exit="exit"
            style={{ pointerEvents: isToolbarVisible ? "auto" : "none" }}
          >
            <motion.div
              ref={toolbarInnerRef}
              className={toolbarClassName}
              layout
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={handleToggleToc}
                aria-label="Toggle table of contents"
              >
                <TocSvg className="h-6 w-6" />
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={handleScrollToComments}
                aria-label="Scroll to comments"
              >
                <CommentSvg className="h-6 w-6" />
              </button>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full text-gray-700 transition hover:text-black dark:text-gray-300 dark:hover:text-white"
                onClick={handleCopyUrl}
                aria-label="Copy article URL"
              >
                <CopySvg className="h-6 w-6" />
              </button>

              <AnimatePresence>
                {isCopied && (
                  <motion.div
                    key="copied-tooltip"
                    className="pointer-events-none absolute left-1/2 bottom-[calc(100%+5px)] z-[70] flex items-center justify-center"
                    variants={copyTooltipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/20 bg-white/50 px-3 py-1 text-sm text-gray-900 shadow-glass backdrop-blur dark:border-black/20 dark:bg-black/25 dark:text-white dark:shadow-glassDark">
                      <CheckSvg className="w-4 h-4 text-green-500 mt-[3.5px]" />
                      {"링크가 복사되었습니다"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isTocOpen && !isDocked && isToolbarVisible && toolbarHeight > 0 && (
        <div
          aria-hidden
          className="w-full"
          style={{ height: toolbarHeight, transition: "height 200ms ease" }}
        />
      )}

      <AnimatePresence>
        {isTocOpen && (
          <motion.div
            key="toc-overlay"
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleCloseToc}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="w-[min(90%,640px)] max-w-[640px] rounded-2xl border border-solid border-[#E4E4E7] bg-white/90 p-6 shadow-2xl outline-none dark:border-[#2F2F37] dark:bg-[#171717]/90"
              onClick={(event) => event.stopPropagation()}
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <Toc
                headings={headings ?? []}
                title={title}
                variant="plain"
                showHeader={false}
                className="space-y-1"
                listClassName="hidden-scrollbar max-h-[60vh] space-y-1 overflow-auto pr-2"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
