"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRef, type KeyboardEvent } from "react";
import { Squircle } from "@/components/Squircle";
import { useHomeSettingsStore, type HomeBackdrop } from "@/stores";
import FolderMiniature from "./FolderMiniature";
import styles from "./FolderHome.module.css";
import { playToggle } from "./sound";
import type { Palette } from "./types";

const KNOB_SPRING = { type: "spring", stiffness: 520, damping: 34 } as const;

// 테마를 바꾸는 프레임 동안 html에 표시를 남겨, 색이 뒤집히는 요소의 전환 효과를 끈다
// (FolderHome.module.css의 html[data-theme-switching])
let themeSwitchFrame = 0;
function markThemeSwitch() {
  const root = document.documentElement;
  root.dataset.themeSwitching = "";
  cancelAnimationFrame(themeSwitchFrame);
  themeSwitchFrame = requestAnimationFrame(() => {
    themeSwitchFrame = requestAnimationFrame(() => {
      delete root.dataset.themeSwitching;
    });
  });
}

// [가로 %, 세로 %, 크기 em]
const SKY_STARS = [
  [16, 28, 0.15],
  [31, 60, 0.1],
  [22, 74, 0.12],
  [42, 32, 0.1],
  [50, 66, 0.14],
] as const;

// 해가 지면 구름이 빠지고 별이 뜨는 낮/밤 스위치
function SkySwitch({
  dark,
  onChange,
}: {
  dark: boolean;
  onChange: (dark: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="다크 모드"
      className={styles.sky}
      data-dark={dark}
      onClick={() => onChange(!dark)}
    >
      <span className={styles.skyDay} />
      <span className={styles.skyNight} />
      {SKY_STARS.map(([x, y, size], i) => (
        <span
          key={i}
          className={styles.skyStar}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${size}em`,
            height: `${size}em`,
            animationDelay: `${i * -0.7}s`,
          }}
        />
      ))}
      <span className={styles.cloud} data-i="0" />
      <span className={styles.cloud} data-i="1" />
      <motion.span
        className={styles.skyKnob}
        initial={false}
        animate={{ x: dark ? "2.3em" : "0em", rotate: dark ? 0 : -45 }}
        transition={KNOB_SPRING}
      >
        <span className={styles.sun} />
        <span className={styles.moon}>
          <i />
          <i />
          <i />
        </span>
      </motion.span>
    </button>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.toggle}
      data-on={checked}
      onClick={() => onChange(!checked)}
    >
      <motion.span
        className={styles.toggleKnob}
        initial={false}
        animate={{ x: checked ? "1.15em" : "0em" }}
        transition={KNOB_SPRING}
      />
    </button>
  );
}

const BACKDROPS: { value: HomeBackdrop; label: string }[] = [
  { value: "plain", label: "기본" },
  { value: "stars", label: "별빛" },
  { value: "aurora", label: "오로라" },
];

// 16:10 미리보기 위의 별 [x, y, 반지름] — 가운데 폴더 자리는 비워 둔다
const PREVIEW_STARS = [
  [4, 5, 0.9],
  [9, 13, 0.6],
  [5, 22, 0.7],
  [11, 27, 0.5],
  [16, 3, 0.7],
  [24, 2.5, 0.5],
  [31, 4, 0.8],
  [38, 9, 1],
  [44, 4, 0.6],
  [43, 15, 0.7],
  [39, 24, 0.5],
  [46, 27, 0.6],
] as const;

// 라이트 모드의 별자리 선
const PREVIEW_LINES = ["4,5 9,13 5,22", "38,9 44,4 43,15"];

function BackdropPicker({
  value,
  unit,
  folderPalettes,
  onChange,
}: {
  value: HomeBackdrop;
  unit: number;
  folderPalettes: Palette[];
  onChange: (value: HomeBackdrop) => void;
}) {
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 라디오 그룹처럼 화살표로 고를 수 있게 한다
  const onKeyDown = (event: KeyboardEvent) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      event.key
    ];
    if (!step) return;
    event.preventDefault();
    const index = BACKDROPS.findIndex((option) => option.value === value);
    const next = (index + step + BACKDROPS.length) % BACKDROPS.length;
    onChange(BACKDROPS[next].value);
    optionRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="배경"
      className={styles.backdropOptions}
      onKeyDown={onKeyDown}
    >
      {BACKDROPS.map((option, i) => (
        <button
          key={option.value}
          ref={(el) => {
            optionRefs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          tabIndex={value === option.value ? 0 : -1}
          className={styles.backdropOption}
          onClick={() => onChange(option.value)}
        >
          <Squircle
            as="span"
            cornerRadius={unit * 0.6}
            cornerSmoothing={0.6}
            className={styles.preview}
            data-preview={option.value}
          >
            {option.value === "stars" && (
              <svg
                viewBox="0 0 48 30"
                className={styles.previewStars}
                aria-hidden
              >
                {PREVIEW_LINES.map((points) => (
                  <polyline key={points} points={points} />
                ))}
                {PREVIEW_STARS.map(([x, y, r]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
                ))}
              </svg>
            )}
            <FolderMiniature palettes={folderPalettes} />
          </Squircle>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** 설정 카드 뒷면의 조절 항목들 */
export default function SettingsPanel({
  unit,
  folderPalettes,
}: {
  unit: number;
  /** 지금 폴더에 꽂힌 카드 색 (미리보기 속 폴더에 쓴다) */
  folderPalettes: Palette[];
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  const { backdrop, sound, setBackdrop, setSound } = useHomeSettingsStore();

  return (
    <div className={styles.settings}>
      <div className={styles.settingRow}>
        <div>
          <p className={styles.settingLabel}>화면</p>
          <p className={styles.settingHint}>
            {dark ? "밤하늘처럼 어둡게" : "한낮처럼 밝게"}
          </p>
        </div>
        <SkySwitch
          dark={dark}
          onChange={(next) => {
            markThemeSwitch();
            setTheme(next ? "dark" : "light");
            playToggle(next);
          }}
        />
      </div>
      <div className={styles.settingBlock}>
        <p className={styles.settingLabel}>배경</p>
        <BackdropPicker
          value={backdrop}
          unit={unit}
          folderPalettes={folderPalettes}
          onChange={(next) => {
            setBackdrop(next);
            playToggle(true);
          }}
        />
      </div>
      <div className={styles.settingRow}>
        <div>
          <p className={styles.settingLabel}>효과음</p>
          <p className={styles.settingHint}>
            카드를 넘기고 펼칠 때 작은 소리가 나요
          </p>
        </div>
        <Toggle
          label="효과음"
          checked={sound}
          onChange={(next) => {
            setSound(next);
            playToggle(next);
          }}
        />
      </div>
    </div>
  );
}
