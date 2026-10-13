import Image from "next/image";
import type { CSSProperties } from "react";
import BlogSvg from "@/public/svg/blog.svg";
import styles from "./FolderHome.module.css";
import type { FolderItem, Palette } from "./types";

export const paletteStyle = (palette: Palette) =>
  ({ "--from": palette.from, "--to": palette.to }) as CSSProperties;

export function Emblem({
  item,
  className,
}: {
  item: FolderItem;
  className: string;
}) {
  if (item.kind === "writing") {
    return (
      <span className={`${className} ${styles.emblemGlyph}`}>
        <BlogSvg aria-hidden />
      </span>
    );
  }

  const src = item.kind === "about" ? item.avatar : item.thumbnail;
  return (
    <span
      className={className}
      data-shape={item.kind === "about" ? "round" : undefined}
    >
      <Image src={src} alt="" fill sizes="112px" className="object-cover" />
    </span>
  );
}

interface CardFaceProps {
  item: FolderItem;
  /** 카드 앞면에 표시할 순번 (0부터) */
  index: number;
}

export default function CardFace({ item, index }: CardFaceProps) {
  return (
    <span
      className={styles.card}
      data-ink={item.palette.ink}
      style={paletteStyle(item.palette)}
    >
      <span className={styles.orbit} aria-hidden />
      <span className={styles.cardTop}>
        <span>{item.kicker}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </span>
      <Emblem item={item} className={styles.emblem} />
      <span className={styles.cardBottom}>
        <span className={styles.cardTitle}>{item.title}</span>
        <span className={styles.cardSubline}>{item.subline}</span>
      </span>
    </span>
  );
}
