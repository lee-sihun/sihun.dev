"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useHomeSettingsStore } from "@/stores";
import styles from "./FolderHome.module.css";
import type { Palette } from "./types";

interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
  twinkle: number;
  phase: number;
}

interface Meteor {
  x: number;
  y: number;
  angle: number;
  length: number;
  born: number;
}

const METEOR_LIFE = 900;

function makeStars(w: number, h: number): Star[] {
  const count = Math.round(Math.min(220, Math.max(60, (w * h) / 9000)));
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: 0.35 + Math.pow(Math.random(), 3) * 1.25,
    alpha: 0.25 + Math.random() * 0.7,
    twinkle: 0.4 + Math.random(),
    phase: Math.random() * Math.PI * 2,
  }));
}

// 라이트 모드에서는 가까운 별끼리 이어 별자리 지도처럼 보이게 한다
function makeConstellations(stars: Star[]) {
  const bright = stars.filter((s) => s.r > 0.8).slice(0, 5);
  return bright.map((seed) => {
    const chain = [seed];
    let current = seed;
    for (let i = 0; i < 3; i++) {
      const next = stars
        .filter((s) => !chain.includes(s))
        .sort(
          (a, b) =>
            Math.hypot(a.x - current.x, a.y - current.y) -
            Math.hypot(b.x - current.x, b.y - current.y)
        )[0];
      if (!next || Math.hypot(next.x - current.x, next.y - current.y) > 110)
        break;
      chain.push(next);
      current = next;
    }
    return chain;
  });
}

function StarField({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion() ?? false;
  // 테마만 바뀌어 다시 그릴 때는 같은 별을 이어서 쓴다 (새로 뿌리면 별이 한꺼번에 자리를 옮긴다)
  const kept = useRef<{ w: number; h: number; stars: Star[] }>();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let w = 0;
    let h = 0;
    let stars: Star[] = [];
    let constellations: Star[][] = [];
    let meteor: Meteor | null = null;
    let nextMeteor = performance.now() + 2500;
    let last = performance.now();
    let raf = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const prev = kept.current;
      stars =
        prev && prev.w === w && prev.h === h ? prev.stars : makeStars(w, h);
      kept.current = { w, h, stars };
      constellations = dark ? [] : makeConstellations(stars);
    };

    const draw = (now: number) => {
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      ctx.clearRect(0, 0, w, h);

      for (const star of stars) {
        // 큰(가까운) 별일수록 조금 더 빨리 흘러간다
        star.x -= (1.2 + star.r * 2.4) * dt * (reduceMotion ? 0 : 1);
        if (star.x < -2) star.x += w + 4;
        const glow = reduceMotion
          ? 0.8
          : 0.55 + 0.45 * Math.sin((now / 1000) * star.twinkle + star.phase);
        ctx.fillStyle = dark
          ? `rgba(255, 255, 255, ${star.alpha * glow})`
          : `rgba(28, 30, 40, ${star.alpha * glow * 0.45})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!dark) {
        ctx.strokeStyle = "rgba(28, 30, 40, 0.09)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (const chain of constellations) {
          for (let i = 1; i < chain.length; i++) {
            const [a, b] = [chain[i - 1], chain[i]];
            // 화면 끝을 넘어 반대편으로 돌아간 별과는 잇지 않는다
            if (Math.hypot(a.x - b.x, a.y - b.y) > 200) continue;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
          }
        }
        ctx.stroke();
      }

      // 다크 모드에서는 가끔 별똥별이 지나간다
      if (dark && !reduceMotion) {
        if (!meteor && now > nextMeteor) {
          meteor = {
            x: w * (0.35 + Math.random() * 0.7),
            y: h * (Math.random() * 0.35 - 0.05),
            angle: Math.PI * (0.8 + Math.random() * 0.08),
            length: 140 + Math.random() * 90,
            born: now,
          };
        }
        if (meteor) {
          const life = (now - meteor.born) / METEOR_LIFE;
          if (life >= 1) {
            meteor = null;
            nextMeteor = now + 7000 + Math.random() * 7000;
          } else {
            const travel = life * 520;
            const hx = meteor.x + Math.cos(meteor.angle) * travel;
            const hy = meteor.y + Math.sin(meteor.angle) * travel;
            const tx = hx - Math.cos(meteor.angle) * meteor.length;
            const ty = hy - Math.sin(meteor.angle) * meteor.length;
            const fade = Math.sin(life * Math.PI);
            const gradient = ctx.createLinearGradient(hx, hy, tx, ty);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.85 * fade})`);
            gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.4;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(tx, ty);
            ctx.stroke();
          }
        }
      }

      if (!reduceMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const observer = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(performance.now());
    });
    observer.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [dark, reduceMotion]);

  return <canvas ref={canvasRef} className={styles.starfield} aria-hidden />;
}

// 어두운 화면에서는 밝은 색이, 밝은 화면에서는 진한 색이 은은하게 번진다
function Aurora({ palettes }: { palettes: Palette[] }) {
  return (
    <div className={styles.aurora} aria-hidden>
      {palettes.map((palette, i) => (
        <span
          key={i}
          className={styles.auroraBlob}
          data-index={i}
          style={
            {
              "--aurora-light": palette.to,
              "--aurora-dark": palette.from,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** 설정 카드에서 고른 배경 (기본은 단색이라 아무것도 그리지 않는다) */
export default function Backdrop({ palettes }: { palettes: Palette[] }) {
  const backdrop = useHomeSettingsStore((state) => state.backdrop);
  const { resolvedTheme } = useTheme();
  // 저장된 설정은 브라우저에만 있으므로 서버 렌더와 어긋나지 않게 마운트 뒤에 그린다
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {backdrop !== "plain" && (
        <motion.div
          key={backdrop}
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {backdrop === "stars" ? (
            <StarField dark={resolvedTheme !== "light"} />
          ) : (
            <Aurora palettes={palettes} />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
