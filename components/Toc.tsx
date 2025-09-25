"use client";

import { useCallback, useEffect, type MouseEvent } from "react";

interface Heading {
  level: number;
  text: string;
  slug: string;
}

interface TocProps {
  headings: Heading[];
}

const baseLinkClass =
  "relative block rounded-lg py-1.5 leading-relaxed transition-colors duration-200 hover:bg-[#F4F4F5] dark:hover:bg-[#1F1F1F] hover:text-[#111827] dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0C0C0C]";

const getIndentClass = (level: number) => {
  switch (level) {
    case 1:
      return "pl-4 pr-4 text-[15px] font-semibold text-[#171717] dark:text-white";
    case 2:
      return "pl-7 pr-4 text-sm font-medium text-[#3F3F46] dark:text-[#E5E5E5]";
    case 3:
      return "pl-10 pr-4 text-sm text-[#52525B] dark:text-[#A1A1AA]";
    case 4:
      return "pl-12 pr-4 text-sm text-[#6B7280] dark:text-[#9CA3AF]";
    default:
      return "pl-4 pr-4 text-sm text-[#3F3F46] dark:text-[#D4D4D4]";
  }
};

type HistoryState = {
  slug?: string;
  scrollY?: number;
  [key: string]: unknown;
};

export default function Toc({ headings }: TocProps) {
  if (!headings || headings.length === 0) {
    return null;
  }

  const preserveCurrentPosition = useCallback(() => {
    if (typeof window === "undefined") return;

    const existingState = (window.history.state ?? {}) as HistoryState;
    const currentSlug =
      existingState.slug ??
      (window.location.hash ? window.location.hash.slice(1) : undefined);

    window.history.replaceState(
      { ...existingState, slug: currentSlug, scrollY: window.scrollY },
      "",
      window.location.href
    );
  }, []);

  const scrollToHeading = useCallback(
    (slug: string, options?: { updateHistory?: boolean; smooth?: boolean }) => {
      if (typeof window === "undefined") return;

      const { updateHistory = true, smooth } = options ?? {};
      const hash = `#${slug}`;
      const findTarget = () => {
        const byId = document.getElementById(slug);
        if (byId) return byId;

        const anchors = Array.from(
          document.querySelectorAll<HTMLAnchorElement>(`a[href="${hash}"]`)
        );

        for (const anchor of anchors) {
          const heading = anchor.closest("h1, h2, h3, h4, h5, h6");
          if (heading) return heading as HTMLElement;
        }

        return anchors[0]?.parentElement ?? null;
      };

      const target = findTarget();

      if (!target) {
        if (updateHistory) {
          window.location.hash = hash;
        }
        return;
      }

      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ??
        false;

      const behavior =
        smooth === false
          ? "auto"
          : smooth === true
          ? "smooth"
          : prefersReducedMotion
          ? "auto"
          : "smooth";

      target.scrollIntoView({
        behavior,
        block: "start",
      });

      if (!updateHistory) {
        return;
      }

      window.requestAnimationFrame(() => {
        const nextState: HistoryState = {
          slug,
          scrollY: window.scrollY,
        };

        if (window.location.hash !== hash) {
          window.history.pushState(nextState, "", hash);
        } else {
          window.history.replaceState(nextState, "", hash);
        }
      });
    },
    []
  );

  useEffect(() => {
    preserveCurrentPosition();
  }, [preserveCurrentPosition]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = (event: PopStateEvent) => {
      const state = (event.state ?? {}) as HistoryState;
      const slugFromState = state.slug;
      const slugFromHash = window.location.hash
        ? window.location.hash.slice(1)
        : undefined;
      const slug = slugFromState || slugFromHash;

      if (typeof state.scrollY === "number") {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: state.scrollY!, behavior: "auto" });
        });
        return;
      }

      if (!slug) return;

      window.requestAnimationFrame(() => {
        scrollToHeading(slug, { updateHistory: false, smooth: false });
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [scrollToHeading]);

  const handleAnchorClick = (
    event: MouseEvent<HTMLAnchorElement>,
    slug: string
  ) => {
    event.preventDefault();
    preserveCurrentPosition();
    scrollToHeading(slug);
    event.currentTarget.blur();
  };

  return (
    <nav
      aria-label="Table of contents"
      className="not-prose mb-10 rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white/80 dark:bg-[#111111]/80 backdrop-blur-sm shadow-[0_12px_32px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
    >
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <span
          aria-hidden="true"
          className="inline-flex h-2.5 w-2.5 rounded-full bg-[#6366F1]"
        />
        <p className="text-sm font-semibold text-[#171717] dark:text-white">
          목차
        </p>
      </div>
      <div className="mx-5 border-t border-dashed border-[#E5E5E5] dark:border-[#2F2F2F]" />
      <ul className="px-2 py-4 list-none space-y-1.5">
        {headings.map(({ slug, text, level }) => (
          <li key={slug}>
            <a
              href={`#${slug}`}
              className={`${baseLinkClass} ${getIndentClass(level)}`}
              onClick={(event) => handleAnchorClick(event, slug)}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
