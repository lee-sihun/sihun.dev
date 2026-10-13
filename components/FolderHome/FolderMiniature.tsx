import { useId } from "react";
import { BACK_PATH } from "./GlassFolder";
import { DESIGN, folderSlot } from "./geometry";
import styles from "./FolderHome.module.css";
import type { Palette } from "./types";

const {
  folderW: W,
  folderH: H,
  frontTop,
  cardW,
  cardH,
  inFolderScale,
} = DESIGN;
const CARD_W = cardW * inFolderScale;
const CARD_H = cardH * inFolderScale;
const CARD_R = 1.25 * (cardW / 14.5) * inFolderScale;
// 앞판 모서리: .front 의 border-radius(1.05em, 1.5em)를 폴더 단위(16px)로 옮긴 값
const TOP_R = 16.8;
const BOTTOM_R = 24;
const FRONT_PATH = [
  `M 0 ${frontTop + TOP_R}`,
  `A ${TOP_R} ${TOP_R} 0 0 1 ${TOP_R} ${frontTop}`,
  `H ${W - TOP_R}`,
  `A ${TOP_R} ${TOP_R} 0 0 1 ${W} ${frontTop + TOP_R}`,
  `V ${H - BOTTOM_R}`,
  `A ${BOTTOM_R} ${BOTTOM_R} 0 0 1 ${W - BOTTOM_R} ${H}`,
  `H ${BOTTOM_R}`,
  `A ${BOTTOM_R} ${BOTTOM_R} 0 0 1 0 ${H - BOTTOM_R}`,
  "Z",
].join(" ");

/**
 * 설정 카드의 배경 미리보기에 들어가는 작은 폴더.
 * 실제 폴더와 같은 좌표·모양을 쓰고, palettes는 폴더 안 왼쪽부터의 카드 색이다.
 */
export default function FolderMiniature({ palettes }: { palettes: Palette[] }) {
  const id = useId().replace(/:/g, "");
  const half = Math.floor(palettes.length / 2);
  // 실제 폴더처럼 가운데 카드가 맨 앞에 오도록 바깥쪽 카드부터 그린다
  const cards = palettes
    .map((palette, i) => ({
      palette,
      offset: i - half,
      slot: folderSlot(i - half),
    }))
    .sort((a, b) => Math.abs(b.offset) - Math.abs(a.offset));

  const cardRects = cards.map(({ offset, slot }) => (
    <rect
      key={offset}
      x={slot.x - CARD_W / 2}
      y={slot.top}
      width={CARD_W}
      height={CARD_H}
      rx={CARD_R}
      fill={`url(#${id}-${offset + half})`}
      transform={`rotate(${slot.rotate} ${slot.x} ${slot.top + CARD_H / 2})`}
    />
  ));

  return (
    <svg
      viewBox={`-12 -12 ${W + 24} ${H + 24}`}
      className={styles.miniFolder}
      aria-hidden
    >
      <defs>
        {cards.map(({ palette, offset }) => (
          <linearGradient
            key={offset}
            id={`${id}-${offset + half}`}
            x1="0"
            y1="0"
            x2="0.4"
            y2="1"
          >
            <stop offset="0" stopColor={palette.from} />
            <stop offset="1" stopColor={palette.to} />
          </linearGradient>
        ))}
        <clipPath id={`${id}-above`}>
          <rect x={-12} y={-12} width={W + 24} height={frontTop + 12} />
        </clipPath>
        <clipPath id={`${id}-front`}>
          <path d={FRONT_PATH} />
        </clipPath>
        {/* 실제 앞판의 blur(12px)를 폴더 단위 그대로 옮긴 값 */}
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={12} />
        </filter>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" className={styles.miniGlassTop} />
          <stop offset="0.4" className={styles.miniGlassMiddle} />
          <stop offset="1" className={styles.miniGlassBottom} />
        </linearGradient>
      </defs>
      <path d={BACK_PATH} className={styles.miniBack} />
      {/* 앞판 위로 나온 부분은 선명하게, 앞판 뒤는 유리를 거쳐 흐리게 보인다 */}
      <g clipPath={`url(#${id}-above)`}>{cardRects}</g>
      <g clipPath={`url(#${id}-front)`}>
        <g filter={`url(#${id}-blur)`}>{cardRects}</g>
      </g>
      <path
        d={FRONT_PATH}
        fill={`url(#${id}-glass)`}
        className={styles.miniFront}
      />
    </svg>
  );
}
