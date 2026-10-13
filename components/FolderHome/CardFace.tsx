import Image from "next/image";
import { useId, useMemo, type CSSProperties } from "react";
import CardMark from "./CardMark";
import Glyph from "./Glyph";
import styles from "./FolderHome.module.css";
import { squircleClip, squirclePath } from "./squircle";
import type { FolderItem, Palette } from "./types";

/** 카드 너비를 14.5em으로 두고 카드 안의 모든 크기를 em으로 잡는다 */
export const CARD_EMS = 14.5;
export const CARD_RADIUS = 1.25;

export const paletteStyle = (palette: Palette) =>
  ({ "--from": palette.from, "--to": palette.to }) as CSSProperties;

export function Emblem({
  item,
  size,
  radius,
  className,
}: {
  item: FolderItem;
  /** px */
  size: number;
  /** px */
  radius: number;
  className: string;
}) {
  const clipPath = useMemo(
    () => squircleClip(size, size, radius),
    [size, radius]
  );

  return (
    <span className={className}>
      <span
        className={styles.emblemTile}
        style={{ width: size, height: size, clipPath }}
      >
        {item.kind === "writing" || item.kind === "settings" ? (
          <span className={styles.emblemGlyph} data-kind={item.kind}>
            <Glyph kind={item.kind} />
          </span>
        ) : (
          <Image
            src={item.kind === "about" ? item.avatar : item.thumbnail}
            alt=""
            fill
            sizes="112px"
            className="object-cover"
          />
        )}
      </span>
    </span>
  );
}

interface CardFaceProps {
  item: FolderItem;
  /** 카드 앞면에 표시할 순번 (0부터) */
  index: number;
  width: number;
  height: number;
}

export default function CardFace({
  item,
  index,
  width,
  height,
}: CardFaceProps) {
  const id = useId().replace(/:/g, "");
  const unit = width / CARD_EMS;
  const radius = CARD_RADIUS * unit;
  const shape = useMemo(
    () => ({
      clip: squircleClip(width, height, radius),
      rim: squirclePath(width - 1, height - 1, radius - 0.5),
    }),
    [width, height, radius]
  );

  return (
    <span
      className={styles.card}
      data-ink={item.palette.ink}
      style={{ ...paletteStyle(item.palette), clipPath: shape.clip }}
    >
      <CardMark item={item} />
      <span className={styles.cardTop}>
        <span>{item.kicker}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </span>
      <Emblem
        item={item}
        size={3.5 * unit}
        radius={0.95 * unit}
        className={styles.emblem}
      />
      <span className={styles.cardBottom}>
        <span className={styles.cardTitle}>{item.title}</span>
        <span className={styles.cardSubline}>{item.subline}</span>
      </span>
      <svg
        className={styles.cardRim}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.14" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path
          d={shape.rim}
          transform="translate(0.5 0.5)"
          fill="none"
          stroke={`url(#${id}-rim)`}
        />
      </svg>
    </span>
  );
}
