import Image from "next/image";
import { useId, useMemo } from "react";
import BlogSvg from "@/public/svg/blog.svg";
import { toBraille } from "./braille";
import styles from "./FolderHome.module.css";
import type { FolderItem } from "./types";

type MarkVariant = "image" | "braille";

// 지금은 이미지 장식을 쓴다. 점자 장식은 나중에 다시 쓸 수 있게 남겨 둔다
const CARD_MARK = "image" as MarkVariant;

// 카드 이미지를 흑백 망점으로 바꿔 카드 색에 스며들게 한다
function ImageMark({ item }: { item: FolderItem }) {
  if (!item.art) {
    return (
      <span className={`${styles.imageMark} ${styles.glyphMark}`} aria-hidden>
        <BlogSvg />
      </span>
    );
  }
  // 밝은 글자 카드에는 밝은 형태(screen), 어두운 글자 카드에는 어두운 형태(multiply)로 얹는다
  const invert = item.palette.ink === item.art.tone;
  return (
    <span
      className={styles.imageMark}
      data-blend={item.palette.ink === "light" ? "screen" : "multiply"}
      aria-hidden
    >
      <Image
        src={item.art.src}
        alt=""
        fill
        sizes="400px"
        className="object-cover"
        style={{
          filter: `grayscale(1) contrast(1.5)${invert ? " invert(1)" : ""}`,
        }}
      />
    </span>
  );
}

// ───────── 점자 장식 (지금은 쓰지 않음) ─────────

// 점자 배치 (단위: 한 셀 안의 점 간격)
const DOT_RADIUS = 0.36;
const CELL_PITCH = 2.5;
const LINE_PITCH = 4;
const COLUMNS = 8;
const ROWS = 5;
const EM_PER_UNIT = 0.6;

// 제목을 점자로 옮겨 줄마다 이어 쓰고, 카드 안쪽에 걸친 부분만 보이게 한다
function BrailleMark({ text }: { text: string }) {
  const id = useId().replace(/:/g, "");
  const dots = useMemo(() => {
    const cells = toBraille(text);
    if (!cells.length) return [];
    const stream = [...cells, 0];
    const result: { x: number; y: number }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLUMNS; col++) {
        const bits = stream[(row * COLUMNS + col) % stream.length];
        for (let dot = 0; dot < 6; dot++) {
          if (!(bits & (1 << dot))) continue;
          result.push({
            x: col * CELL_PITCH + (dot < 3 ? 0 : 1),
            y: row * LINE_PITCH + (dot % 3),
          });
        }
      }
    }
    return result;
  }, [text]);

  const width = (COLUMNS - 1) * CELL_PITCH + 1 + DOT_RADIUS * 2;
  const height = (ROWS - 1) * LINE_PITCH + 2 + DOT_RADIUS * 2;

  return (
    <svg
      className={styles.braille}
      viewBox={`${-DOT_RADIUS} ${-DOT_RADIUS} ${width} ${height}`}
      style={{
        width: `${width * EM_PER_UNIT}em`,
        height: `${height * EM_PER_UNIT}em`,
      }}
      aria-hidden
    >
      <defs>
        <radialGradient id={`${id}-bump`} cx="38%" cy="32%" r="72%">
          <stop offset="0" className={styles.bumpLight} />
          <stop offset="1" className={styles.bumpBase} />
        </radialGradient>
      </defs>
      {dots.map(({ x, y }) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y + 0.1}
            r={DOT_RADIUS}
            className={styles.bumpShadow}
          />
          <circle cx={x} cy={y} r={DOT_RADIUS} fill={`url(#${id}-bump)`} />
        </g>
      ))}
    </svg>
  );
}

export default function CardMark({ item }: { item: FolderItem }) {
  return CARD_MARK === "braille" ? (
    <BrailleMark text={item.title} />
  ) : (
    <ImageMark item={item} />
  );
}
