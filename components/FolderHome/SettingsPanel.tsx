"use client";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useRef, type KeyboardEvent } from "react";
import { Squircle } from "@/components/Squircle";
import { useHomeSettingsStore, type HomeBackdrop } from "@/stores";
import styles from "./FolderHome.module.css";
import { playToggle } from "./sound";

const KNOB_SPRING = { type: "spring", stiffness: 520, damping: 34 } as const;

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

// [x, y, 반지름]
const PREVIEW_STARS = [
  [9, 12, 1.1],
  [17, 18, 0.8],
  [25, 13, 1.2],
  [31, 22, 0.9],
  [6, 31, 0.6],
  [20, 34, 0.7],
  [33, 37, 0.5],
  [13, 26, 0.5],
  [29, 6, 0.6],
] as const;

function BackdropPicker({
  value,
  unit,
  onChange,
}: {
  value: HomeBackdrop;
  unit: number;
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
            cornerRadius={unit * 0.7}
            cornerSmoothing={0.6}
            className={styles.preview}
            data-preview={option.value}
          >
            {option.value === "plain" && (
              <span className={styles.previewFolder} />
            )}
            {option.value === "stars" && (
              <svg
                viewBox="0 0 40 44"
                className={styles.previewStars}
                aria-hidden
              >
                <polyline points="9,12 17,18 25,13 31,22" />
                {PREVIEW_STARS.map(([x, y, r]) => (
                  <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
                ))}
              </svg>
            )}
          </Squircle>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** 설정 카드 뒷면의 조절 항목들 */
export default function SettingsPanel({ unit }: { unit: number }) {
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
