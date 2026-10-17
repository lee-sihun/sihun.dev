"use client";
import { animate, motion, useMotionValue } from "framer-motion";
import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import MailSvg from "@/public/svg/mail.svg";
import GithubSvg from "@/public/svg/github.svg";
import DiscordSvg from "@/public/svg/discord.svg";
import { Squircle } from "@/components/Squircle";
import CardFace, {
  CARD_EMS,
  CARD_RADIUS,
  Emblem,
  paletteStyle,
} from "./CardFace";
import styles from "./FolderHome.module.css";
import SettingsPanel from "./SettingsPanel";
import { squircleClip } from "./squircle";
import type {
  AboutItem,
  FolderItem,
  Palette,
  ProjectItem,
  SettingsItem,
  WritingItem,
} from "./types";

export interface CardFrame {
  cx: number;
  cy: number;
  width: number;
  rotate: number;
}

interface CardDetailProps {
  item: FolderItem;
  index: number;
  closing: boolean;
  cardW: number;
  cardH: number;
  viewport: { w: number; h: number };
  reduceMotion: boolean;
  /** 지금 카드가 화면에 놓인 위치 */
  getFrame: () => CardFrame;
  onRequestClose: () => void;
  onClosed: () => void;
  /** 설정 카드의 '아무 카드나 뽑기' */
  onShuffle: () => void;
  /** 지금 폴더에 꽂힌 카드 색 (설정 카드의 배경 미리보기용) */
  folderPalettes: Palette[];
}

const OPEN_SPRING = { type: "spring", stiffness: 110, damping: 19 } as const;
// 뒤집기는 이동보다 조금 느리게, 끝에서 살짝 넘어갔다 돌아온다
const FLIP_SPRING = { type: "spring", stiffness: 70, damping: 13 } as const;
const CLOSE_SPRING = { type: "spring", stiffness: 170, damping: 25 } as const;

export default function CardDetail({
  item,
  index,
  closing,
  cardW,
  cardH,
  viewport,
  reduceMotion,
  getFrame,
  onRequestClose,
  onClosed,
  onShuffle,
  folderPalettes,
}: CardDetailProps) {
  const ratio = cardW / cardH;
  // 화면이 아주 작아도 카드 자체보다 작아지지는 않게 한다
  const width = Math.max(
    cardW,
    Math.min(cardW * 1.7, viewport.w - 32, (viewport.h - 64) * ratio)
  );
  const height = width / ratio;
  const fontSize = Math.min(16, Math.max(12.5, width / 26));
  // 앞면은 카드를 그대로 키운 모양, 뒷면은 상세 화면에 맞춘 작은 모서리
  const frontRadius = (CARD_RADIUS * width) / CARD_EMS;
  const backRadius = 1.4 * fontSize;
  const backClip = useMemo(
    () => squircleClip(width, height, backRadius),
    [width, height, backRadius]
  );

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const rotate = useMotionValue(0);
  const rotateY = useMotionValue(reduceMotion ? 180 : 0);
  const opacity = useMotionValue(reduceMotion ? 0 : 1);
  const scrim = useMotionValue(0);
  const dialogRef = useRef<HTMLDivElement>(null);

  // 열릴 때 한 번: 카드가 놓여 있던 자리에서 출발해 가운데로 오면서 뒤집힌다
  useLayoutEffect(() => {
    // 대화상자 자체에 포커스를 두어 닫기 버튼이 강조된 채로 열리지 않게 한다
    dialogRef.current?.focus({ preventScroll: true });
    animate(scrim, 1, { duration: 0.35 });

    if (reduceMotion) {
      animate(opacity, 1, { duration: 0.2 });
      return;
    }

    const frame = getFrame();
    x.set(frame.cx - viewport.w / 2);
    y.set(frame.cy - viewport.h / 2);
    scale.set(frame.width / width);
    rotate.set(frame.rotate);

    animate(x, 0, OPEN_SPRING);
    animate(y, 0, OPEN_SPRING);
    animate(scale, 1, OPEN_SPRING);
    animate(rotate, 0, OPEN_SPRING);
    animate(rotateY, 180, FLIP_SPRING);
  }, []);

  useEffect(() => {
    if (!closing) return;
    animate(scrim, 0, { duration: 0.3 });

    if (reduceMotion) {
      animate(opacity, 0, { duration: 0.15 }).then(onClosed);
      return;
    }

    const frame = getFrame();
    animate(x, frame.cx - viewport.w / 2, CLOSE_SPRING);
    animate(y, frame.cy - viewport.h / 2, CLOSE_SPRING);
    animate(scale, frame.width / width, CLOSE_SPRING);
    animate(rotate, frame.rotate, CLOSE_SPRING);
    animate(rotateY, 0, CLOSE_SPRING).then(onClosed);
  }, [closing]);

  // 대화상자 안에서만 Tab 포커스가 돌도록
  const trapFocus = (event: KeyboardEvent) => {
    if (event.key !== "Tab") return;
    const nodes =
      dialogRef.current?.querySelectorAll<HTMLElement>("a[href], button");
    if (!nodes?.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const titleId = `folder-detail-${item.id}`;

  return createPortal(
    <>
      <motion.div
        className={styles.scrim}
        style={{ opacity: scrim }}
        onClick={onRequestClose}
        aria-hidden
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.flipper}
        onKeyDown={trapFocus}
        style={{
          width,
          height,
          marginLeft: -width / 2,
          marginTop: -height / 2,
          x,
          y,
          scale,
          rotate,
          rotateY,
          opacity,
          transformPerspective: 1600,
          pointerEvents: closing ? "none" : "auto",
        }}
      >
        <div
          className={styles.face}
          style={{ fontSize: width / CARD_EMS, borderRadius: frontRadius }}
          aria-hidden
        >
          <CardFace item={item} index={index} width={width} height={height} />
        </div>
        <div
          className={`${styles.face} ${styles.backSide}`}
          style={{ borderRadius: backRadius }}
        >
          <div
            className={styles.backFace}
            data-ink={item.palette.ink}
            style={{
              ...paletteStyle(item.palette),
              fontSize,
              clipPath: backClip,
            }}
          >
            <div className={styles.backHeader}>
              <span className={styles.backKicker}>
                {item.kicker} · {String(index + 1).padStart(2, "0")}
              </span>
              <button
                type="button"
                className={styles.close}
                onClick={onRequestClose}
                aria-label="닫기"
              >
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </div>
            <Squircle
              cornerRadius={fontSize}
              cornerSmoothing={0.6}
              className={styles.paper}
            >
              {item.kind === "project" && (
                <ProjectBody item={item} titleId={titleId} unit={fontSize} />
              )}
              {item.kind === "about" && (
                <AboutBody item={item} titleId={titleId} unit={fontSize} />
              )}
              {item.kind === "writing" && (
                <WritingBody item={item} titleId={titleId} unit={fontSize} />
              )}
              {item.kind === "settings" && (
                <SettingsBody
                  item={item}
                  titleId={titleId}
                  unit={fontSize}
                  onShuffle={onShuffle}
                  folderPalettes={folderPalettes}
                />
              )}
            </Squircle>
          </div>
        </div>
      </motion.div>
    </>,
    document.body
  );
}

function ArrowRight() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

// 새 창으로 열리는 사이트 (프로젝트 페이지의 Live Demo 아이콘과 같은 모양)
function ExternalLink() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 4.5H4.5A1.5 1.5 0 0 0 3 6v5.5A1.5 1.5 0 0 0 4.5 13H10a1.5 1.5 0 0 0 1.5-1.5V8M10 3h3v3M13 3 7.5 8.5" />
    </svg>
  );
}

interface BodyProps<T> {
  item: T;
  titleId: string;
  /** 뒷면 글자 크기 (px) */
  unit: number;
}

function Head({
  item,
  titleId,
  unit,
  meta,
}: BodyProps<FolderItem> & { meta: ReactNode }) {
  return (
    <div className={styles.paperHead}>
      <Emblem
        item={item}
        size={3.2 * unit}
        radius={0.85 * unit}
        className={styles.paperEmblem}
      />
      <div>
        <h2 id={titleId} className={styles.paperTitle}>
          {item.title}
        </h2>
        <p className={styles.paperMeta}>{meta}</p>
      </div>
    </div>
  );
}

function ProjectBody({ item, titleId, unit }: BodyProps<ProjectItem>) {
  return (
    <>
      <div className={styles.paperScroll}>
        <Head item={item} titleId={titleId} unit={unit} meta={item.year} />
        <p className={styles.paperText}>{item.summary}</p>
        {(item.period || item.team) && (
          <dl className={styles.facts}>
            {item.period && (
              <>
                <dt>기간</dt>
                <dd>{item.period}</dd>
              </>
            )}
            {item.team && (
              <>
                <dt>구성</dt>
                <dd>{item.team}</dd>
              </>
            )}
          </dl>
        )}
        <div className={styles.chips}>
          {item.techStack.map((tech) => (
            <span key={tech} className={styles.chip}>
              {tech}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.actions}>
        {(item.githubUrl || item.demoUrl) && (
          <div className={styles.secondaryRow}>
            {item.githubUrl && (
              <a
                href={item.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondary}
              >
                <GithubSvg aria-hidden />
                GitHub
              </a>
            )}
            {item.demoUrl && (
              <a
                href={item.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondary}
              >
                <ExternalLink />
                Live
              </a>
            )}
          </div>
        )}
        <Link href={item.url} className={styles.primary}>
          프로젝트 자세히 보기
          <ArrowRight />
        </Link>
      </div>
    </>
  );
}

const LINK_ICONS = { mail: MailSvg, github: GithubSvg, discord: DiscordSvg };

function AboutBody({ item, titleId, unit }: BodyProps<AboutItem>) {
  return (
    <>
      <div className={styles.paperScroll}>
        <Head item={item} titleId={titleId} unit={unit} meta={item.role} />
        {item.intro.map((paragraph) => (
          <p key={paragraph} className={styles.paperText}>
            {paragraph}
          </p>
        ))}
      </div>
      <div className={styles.actions}>
        <div className={styles.secondaryRow}>
          {item.links.map(({ label, href, icon }) => {
            const Icon = LINK_ICONS[icon];
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={styles.secondary}
              >
                <Icon aria-hidden />
                {label}
              </a>
            );
          })}
        </div>
        <Link href="/about" className={styles.primary}>
          소개 더 보기
          <ArrowRight />
        </Link>
      </div>
    </>
  );
}

function WritingBody({ item, titleId, unit }: BodyProps<WritingItem>) {
  return (
    <>
      <div className={styles.paperScroll}>
        <Head
          item={item}
          titleId={titleId}
          unit={unit}
          meta={item.description}
        />
        <nav className={styles.posts} aria-label="최근 글">
          {item.posts.map((post) => (
            <Link key={post.url} href={post.url} className={styles.postLink}>
              <span className={styles.postMeta}>
                {post.date} · {post.category}
              </span>
              <span className={styles.postTitle}>{post.title}</span>
            </Link>
          ))}
        </nav>
      </div>
      <div className={styles.actions}>
        <Link href="/blog" className={styles.primary}>
          전체 글 보기 ({item.total})
          <ArrowRight />
        </Link>
      </div>
    </>
  );
}

function DiceIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="3.2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="5.6" cy="5.6" r="1.1" fill="currentColor" />
      <circle cx="8" cy="8" r="1.1" fill="currentColor" />
      <circle cx="10.4" cy="10.4" r="1.1" fill="currentColor" />
    </svg>
  );
}

function SettingsBody({
  item,
  titleId,
  unit,
  onShuffle,
  folderPalettes,
}: BodyProps<SettingsItem> & {
  onShuffle: () => void;
  folderPalettes: Palette[];
}) {
  return (
    <>
      <div className={styles.paperScroll}>
        <Head item={item} titleId={titleId} unit={unit} meta={item.subline} />
        <SettingsPanel unit={unit} folderPalettes={folderPalettes} />
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onShuffle}>
          <DiceIcon />
          아무 카드나 뽑기
        </button>
      </div>
    </>
  );
}
