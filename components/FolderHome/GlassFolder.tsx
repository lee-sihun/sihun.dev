import { motion, type MotionValue } from "framer-motion";
import { useId, type ReactNode } from "react";
import SaturnSvg from "@/public/svg/saturn.svg";
import { DESIGN } from "./geometry";
import styles from "./FolderHome.module.css";
import type { Palette } from "./types";

const { folderW: W, folderH: H, tabW, tabH, frontTop } = DESIGN;
const R = 24;
const TAB_R = 12;
const TAB_SLOPE = 16;

// 왼쪽 위에 탭이 달린 폴더 뒷판
export const BACK_PATH = [
  `M 0 ${H - R}`,
  `V ${TAB_R}`,
  `A ${TAB_R} ${TAB_R} 0 0 1 ${TAB_R} 0`,
  `H ${tabW - TAB_SLOPE}`,
  `C ${tabW} 0, ${tabW} ${tabH}, ${tabW + TAB_SLOPE} ${tabH}`,
  `H ${W - R}`,
  `A ${R} ${R} 0 0 1 ${W} ${tabH + R}`,
  `V ${H - R}`,
  `A ${R} ${R} 0 0 1 ${W - R} ${H}`,
  `H ${R}`,
  `A ${R} ${R} 0 0 1 0 ${H - R}`,
  "Z",
].join(" ");

// 뒷판 윗변을 따라 맺히는 하이라이트 (양 끝은 그라디언트로 흐려진다)
const BACK_HIGHLIGHT_PATH = [
  `M 0.5 ${TAB_R}`,
  `A ${TAB_R - 0.5} ${TAB_R - 0.5} 0 0 1 ${TAB_R} 0.5`,
  `H ${tabW - TAB_SLOPE}`,
  `C ${tabW} 0.5, ${tabW} ${tabH + 0.5}, ${tabW + TAB_SLOPE} ${tabH + 0.5}`,
  `H ${W - R}`,
  `A ${R - 0.5} ${R - 0.5} 0 0 1 ${W - 0.5} ${tabH + R}`,
].join(" ");

// 꼭짓점마다 반지름을 준 둥근 다각형 ([x, y, 반지름]을 시계 방향으로)
function roundedPolygon(points: [number, number, number][]) {
  const corners = points.map(([x, y, r], i) => {
    const [px, py] = points[(i + points.length - 1) % points.length];
    const [nx, ny] = points[(i + 1) % points.length];
    const la = Math.hypot(px - x, py - y);
    const lb = Math.hypot(nx - x, ny - y);
    const a = [(px - x) / la, (py - y) / la];
    const b = [(nx - x) / lb, (ny - y) / lb];
    // 둥근 곡선이 두 변에 닿는 점까지의 거리
    const t = r / Math.tan(Math.acos(a[0] * b[0] + a[1] * b[1]) / 2);
    return {
      start: [x + a[0] * t, y + a[1] * t],
      end: [x + b[0] * t, y + b[1] * t],
      r,
    };
  });
  const last = corners[corners.length - 1];
  return [
    `M ${last.end[0]} ${last.end[1]}`,
    ...corners.map(
      ({ start, end, r }) =>
        `L ${start[0]} ${start[1]} A ${r} ${r} 0 0 1 ${end[0]} ${end[1]}`
    ),
    "Z",
  ].join(" ");
}

// 탭 안쪽에 탭과 같은 모양으로 들어가는 띠 (지금 가운데 있는 카드 색으로 칠한다).
// 탭 테두리에서 5만큼 안쪽에 두고, 왼쪽 위는 탭 모서리와 중심이 같은 곡선으로,
// 오른쪽 끝은 탭의 S자 경사 한가운데 기울기(약 54°)로 잘라 둥글린다
const TAB_MARK_PATH = roundedPolygon([
  [5, tabH - 5, 2.5],
  [5, 5, TAB_R - 5],
  [tabW - 10.6, 5, 8],
  [tabW - 1.8, tabH - 5, 3],
]);

export interface FolderMotion {
  x: MotionValue<number>;
  y: MotionValue<number>;
  scale: MotionValue<number>;
  tiltX: MotionValue<number>;
  tiltY: MotionValue<number>;
}

interface LayerProps {
  motion: FolderMotion;
  u: number;
  zIndex: number;
  children: ReactNode;
}

// 위치·크기는 바깥에서, 3D 기울기는 안쪽에서 적용해야 원근의 중심이 폴더 가운데에 맞는다.
// 폴더 레이어에는 opacity를 주지 않는다: 앞판의 조상이 반투명해지면 그 조상이 backdrop root가 되어
// 유리(backdrop-filter)가 뒤의 카드를 흐리게 하지 못하고 카드가 선명하게 비친다
function Layer({ motion: m, u, zIndex, children }: LayerProps) {
  return (
    <motion.div
      className={styles.layer}
      style={{
        x: m.x,
        y: m.y,
        scale: m.scale,
        width: W * u,
        height: H * u,
        fontSize: 16 * u,
        zIndex,
      }}
    >
      <motion.div
        className={styles.tilt}
        style={{
          rotateX: m.tiltX,
          rotateY: m.tiltY,
          transformPerspective: 1000 * u,
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export function FolderShadow({
  motion: m,
  u,
  colors,
  opacity,
}: {
  motion: FolderMotion;
  u: number;
  colors: string[];
  opacity: MotionValue<number>;
}) {
  return (
    <motion.div
      className={styles.layer}
      style={{
        x: m.x,
        y: m.y,
        scale: m.scale,
        opacity,
        width: W * u,
        height: H * u,
        zIndex: 5,
      }}
      aria-hidden
    >
      <span
        className={styles.caustic}
        style={{ background: `linear-gradient(90deg, ${colors.join(", ")})` }}
      />
      <span className={styles.floorShadow} />
    </motion.div>
  );
}

export function FolderBack({
  motion: m,
  u,
  palette,
}: {
  motion: FolderMotion;
  u: number;
  /** 지금 가운데 있는 카드 색 (탭 안의 띠에 쓴다) */
  palette: Palette;
}) {
  const id = useId().replace(/:/g, "");

  return (
    <Layer motion={m} u={u} zIndex={10}>
      <svg
        className={styles.back}
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        aria-hidden
      >
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" className={styles.backFillTop} />
            <stop offset="1" className={styles.backFillBottom} />
          </linearGradient>
          <linearGradient
            id={`${id}-highlight`}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={W}
            y2="0"
          >
            <stop
              offset="0"
              stopOpacity="0"
              className={styles.backHighlightStop}
            />
            <stop offset="0.08" className={styles.backHighlightStop} />
            <stop offset="0.8" className={styles.backHighlightStop} />
            <stop
              offset="1"
              stopOpacity="0"
              className={styles.backHighlightStop}
            />
          </linearGradient>
          <linearGradient id={`${id}-mark`} x1="0" y1="0" x2="1" y2="0">
            <stop
              offset="0"
              className={styles.markStop}
              style={{ stopColor: palette.from }}
            />
            <stop
              offset="1"
              className={styles.markStop}
              style={{ stopColor: palette.to }}
            />
          </linearGradient>
        </defs>
        <path
          d={BACK_PATH}
          fill={`url(#${id}-fill)`}
          className={styles.backStroke}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        <path d={TAB_MARK_PATH} fill={`url(#${id}-mark)`} />
        <path
          d={BACK_HIGHLIGHT_PATH}
          fill="none"
          stroke={`url(#${id}-highlight)`}
          strokeWidth={1}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      {/* 탭 글씨는 고칠지 뺄지 정할 때까지 숨겨 둔다
      <span
        className={styles.tabLabel}
        style={{ left: 16 * u, top: 6 * u, fontSize: 9.5 * u }}
        aria-hidden
      >
        sihun.dev
      </span> */}
    </Layer>
  );
}

export function FolderFront({
  motion: m,
  u,
  flap,
  sheenX,
}: {
  motion: FolderMotion;
  u: number;
  flap: MotionValue<number>;
  sheenX: MotionValue<string>;
}) {
  return (
    <Layer motion={m} u={u} zIndex={30}>
      <motion.div
        className={styles.front}
        style={{
          top: frontTop * u,
          rotateX: flap,
          originY: 1,
          transformPerspective: 700 * u,
        }}
      >
        <motion.span
          className={styles.sheen}
          style={{ x: sheenX }}
          aria-hidden
        />
        <span className={styles.lip} aria-hidden />
        <span className={styles.rim} aria-hidden />
        {/* SVGR이 viewBox를 지워서 크기를 줄이면 그림이 잘리므로 다시 넣어준다 */}
        <SaturnSvg viewBox="0 0 32 21" className={styles.etch} aria-hidden />
      </motion.div>
    </Layer>
  );
}
