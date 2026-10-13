import Image from "next/image";
import BlogSvg from "@/public/svg/blog.svg";
import styles from "./FolderHome.module.css";
import type { FolderItem } from "./types";

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

export default function CardMark({ item }: { item: FolderItem }) {
  return <ImageMark item={item} />;
}
