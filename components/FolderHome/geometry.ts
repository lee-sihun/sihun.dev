// 폴더와 카드 배치를 계산하는 순수 함수 모음 (단위: px)

export const DESIGN = {
  cardW: 232,
  cardH: 320,
  folderW: 360,
  folderH: 272,
  tabW: 136,
  tabH: 22,
  /** 폴더 윗변에서 앞판이 시작되는 높이 */
  frontTop: 80,
  /** 폴더 안에 꽂혀 있을 때의 카드 크기 */
  inFolderScale: 0.54,
  /** 열린 뒤 아래로 내려간 폴더 크기 */
  openFolderScale: 0.56,
  barH: 60,
} as const;

export interface Geometry {
  w: number;
  h: number;
  /** 화면 크기에 따른 배율 */
  u: number;
  cardW: number;
  cardH: number;
  closedY: number;
  openY: number;
  fanY: number;
  radius: number;
  spacing: number;
}

export interface Drivers {
  /** 0 닫힘 → 1 열림 */
  t: number;
  /** 가운데에 놓인 카드 인덱스 (드래그 중에는 소수) */
  p: number;
  hover: number;
  enter: number;
  float: number;
}

export interface Pose {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
  zIndex: number;
  /** 폴더 밖으로 나온 정도 (0~1) */
  out: number;
}

export interface FolderPose {
  x: number;
  y: number;
  scale: number;
}

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (from: number, to: number, k: number) =>
  from + (to - from) * k;

const smoothstep = (k: number) => k * k * (3 - 2 * k);

const bezier = (a: number, b: number, c: number, d: number, k: number) => {
  const r = 1 - k;
  return r * r * r * a + 3 * r * r * k * b + 3 * r * k * k * c + k * k * k * d;
};

export function measure(w: number, h: number): Geometry {
  const u = clamp(Math.min(h / 860, (w - 32) / DESIGN.folderW), 0.6, 1.1);
  const cardW = DESIGN.cardW * u;
  const cardH = DESIGN.cardH * u;
  const openHalf = (DESIGN.folderH * DESIGN.openFolderScale * u) / 2;
  const openY = h - 40 * u - openHalf;
  const fanTop = DESIGN.barH + 28 * u + cardH / 2;
  const fanBottom = openY - openHalf - 60 * u - cardH / 2;

  return {
    w,
    h,
    u,
    cardW,
    cardH,
    closedY: h / 2 - 6 * u,
    openY,
    fanY: Math.max(fanTop, (fanTop + fanBottom) / 2),
    radius: 1150 * u,
    spacing: 206 * u,
  };
}

/** 원형으로 이어진 카드 목록에서 p 기준 상대 위치 (-n/2 이상 n/2 미만) */
export function wrapOffset(index: number, p: number, n: number) {
  const d = (((index - p) % n) + n) % n;
  return d >= n / 2 ? d - n : d;
}

export function folderPose(
  { t, enter, float }: Drivers,
  g: Geometry
): FolderPose {
  return {
    x: g.w / 2,
    y:
      lerp(g.closedY, g.openY, t) +
      float * 5 * g.u * (1 - clamp(t, 0, 1)) +
      (1 - enter) * 28 * g.u,
    scale: lerp(1, DESIGN.openFolderScale, t) * lerp(0.96, 1, enter),
  };
}

export function cardPose(
  index: number,
  n: number,
  d: Drivers,
  g: Geometry
): Pose {
  const o = wrapOffset(index, d.p, n);
  const a = Math.abs(o);
  const folder = folderPose(d, g);

  // 폴더 안: 가운데 카드가 가장 높이 솟은 작은 부채꼴
  const slot = clamp(o, -3, 3);
  const sa = Math.abs(slot);
  const appear = clamp((d.enter - 0.3 - sa * 0.05) / 0.5, 0, 1);
  const lift = (8 + (3 - sa) * 4) * d.hover;
  const top =
    -DESIGN.folderH / 2 +
    DESIGN.tabH +
    14 +
    Math.pow(sa, 1.25) * 9 -
    lift +
    (1 - appear) * 30;
  const inX = folder.x + slot * 24 * g.u * folder.scale;
  const inY =
    folder.y +
    (top + (DESIGN.cardH * DESIGN.inFolderScale) / 2) * g.u * folder.scale;
  const inScale = DESIGN.inFolderScale * folder.scale;
  const inRotate = slot * 3.2;

  // 펼친 상태: 반지름이 큰 완만한 아치
  const theta = (o * g.spacing) / g.radius;
  const fanX = g.w / 2 + g.radius * Math.sin(theta);
  const fanY = g.fanY + g.radius * (1 - Math.cos(theta));
  const fanRotate = (theta * 180) / Math.PI;
  const fanScale = 1 - 0.06 * Math.min(a, 1) - 0.04 * clamp(a - 1, 0, 2);
  const fanOpacity = clamp(1 - (a - 2.3) / 0.9, 0, 1);

  // 가운데 카드부터 차례로 빠져나오도록 카드마다 출발을 늦춘다
  const delay = (Math.min(a, 3) / 3) * 0.24;
  const k = clamp((d.t - delay) / (1 - delay), 0, 1.08);
  const kc = Math.min(k, 1);
  // 폴더에서 위로 쑥 빠져나온 뒤 아치 위 자리로 내려앉는 곡선
  const rise = Math.max(90 * g.u, (inY - fanY) * 0.6);

  return {
    x: bezier(inX, inX, fanX, fanX, k),
    y: bezier(inY, inY - rise, fanY + rise * 0.5, fanY, k),
    rotate: lerp(inRotate, fanRotate, smoothstep(kc)),
    scale: lerp(inScale, fanScale, kc),
    opacity: lerp(appear, fanOpacity, kc),
    zIndex: 100 - Math.round(a * 10),
    out: kc,
  };
}
