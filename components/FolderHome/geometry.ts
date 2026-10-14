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
  /** 닫혀 있을 때 폴더 크기 */
  closedFolderScale: 0.9,
  /** 열린 뒤 아래로 내려간 폴더 크기 */
  openFolderScale: 0.56,
  /** 화면 위쪽 여백 */
  topInset: 24,
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
  /** 0이면 여는 움직임, 1이면 닫는 움직임 (방향을 바꾸는 도중에는 그 사이) */
  closing: number;
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

export const smoothstep = (k: number) => k * k * (3 - 2 * k);

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
  const fanTop = DESIGN.topInset + 28 * u + cardH / 2;
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

// 열 때는 카드가 먼저 빠져나간 뒤에 폴더가 내려간다 (t가 이 값을 넘어야 폴더가 움직인다)
const OPEN_FOLDER_LAG = 0.3;

/** 폴더 위치·크기의 진행도. 닫을 때는 처음부터 t를 그대로 따라 올라온다 */
export const folderProgress = (t: number, closing: number) =>
  lerp(
    smoothstep(clamp((t - OPEN_FOLDER_LAG) / (1 - OPEN_FOLDER_LAG), 0, 1)),
    clamp(t, 0, 1),
    closing,
  );

export function folderPose(
  { t, closing, enter, float }: Drivers,
  g: Geometry,
): FolderPose {
  const tf = folderProgress(t, closing);
  return {
    x: g.w / 2,
    y:
      lerp(g.closedY, g.openY, tf) +
      float * 5 * g.u * (1 - clamp(t, 0, 1)) +
      (1 - enter) * 28 * g.u,
    scale:
      lerp(DESIGN.closedFolderScale, DESIGN.openFolderScale, tf) *
      lerp(0.96, 1, enter),
  };
}

/**
 * 닫힌 폴더 안에서 가운데로부터 offset 번째 카드가 놓이는 자리
 * (폴더 왼쪽 위 기준, 폴더 단위 · x는 카드 가운데, top은 카드 윗변)
 */
export function folderSlot(offset: number) {
  const slot = clamp(offset, -3, 3);
  return {
    x: DESIGN.folderW / 2 + slot * 24,
    top: DESIGN.tabH + 14 + Math.pow(Math.abs(slot), 1.25) * 9,
    rotate: slot * 3.2,
  };
}

export function cardPose(
  index: number,
  n: number,
  d: Drivers,
  g: Geometry,
): Pose {
  const o = wrapOffset(index, d.p, n);
  const a = Math.abs(o);
  // 열 때는 '닫혀 있을 때의 폴더'를 기준으로 삼는다. 폴더는 카드가 빠져나간 뒤에야 움직이므로
  // 그 전까지는 실제 폴더와 같은 자리이고, 내려가는 폴더가 카드를 끌어내리지 않는다.
  // 닫을 때는 움직이는 폴더를 기준으로 삼아, 아래쪽 폴더로 들어간 뒤 폴더와 함께 올라온다
  const closedFolder = folderPose({ ...d, t: 0 }, g);
  const movingFolder = folderPose(d, g);
  const folder = {
    x: lerp(closedFolder.x, movingFolder.x, d.closing),
    y: lerp(closedFolder.y, movingFolder.y, d.closing),
    scale: lerp(closedFolder.scale, movingFolder.scale, d.closing),
  };

  // 폴더 안: 가운데 카드가 가장 높이 솟은 작은 부채꼴
  const rest = folderSlot(o);
  const sa = Math.abs(clamp(o, -3, 3));
  const appear = clamp((d.enter - 0.3 - sa * 0.05) / 0.5, 0, 1);
  const lift = (8 + (3 - sa) * 4) * d.hover;
  const top = rest.top - DESIGN.folderH / 2 - lift + (1 - appear) * 30;
  const inX = folder.x + (rest.x - DESIGN.folderW / 2) * g.u * folder.scale;
  const inY =
    folder.y +
    (top + (DESIGN.cardH * DESIGN.inFolderScale) / 2) * g.u * folder.scale;
  const inScale = DESIGN.inFolderScale * folder.scale;
  const inRotate = rest.rotate;

  // 펼친 상태: 반지름이 큰 완만한 아치
  const theta = (o * g.spacing) / g.radius;
  const fanX = g.w / 2 + g.radius * Math.sin(theta);
  const fanY = g.fanY + g.radius * (1 - Math.cos(theta));
  const fanRotate = (theta * 180) / Math.PI;
  const fanScale = 1 - 0.06 * Math.min(a, 1) - 0.04 * clamp(a - 1, 0, 2);
  const fanOpacity = clamp(1 - (a - 2.3) / 0.9, 0, 1);

  // 가운데 카드부터 차례로 빠져나오도록 카드마다 출발을 조금씩 늦춘다 (닫을 때는 간격을 조금 더 둔다)
  const delay = (Math.min(a, 3) / 3) * lerp(0.18, 0.24, d.closing);
  const k = clamp((d.t - delay) / (1 - delay), 0, 1);
  // 열 때: 폴더 위로 빠져나온 뒤 아치 위 자리로 이어지는 곡선.
  //   제어점이 도착점을 넘지 않아 중간에 멈칫하거나 지나쳤다 돌아오지 않는다
  // 닫을 때: 아치에서 살짝 내려온 뒤 폴더 위로 솟았다가 떨어지듯 들어간다
  const dy = inY - fanY;
  const rise = Math.max(90 * g.u, dy * 0.6);
  const climb = lerp(clamp(dy * 0.45, 36 * g.u, 150 * g.u), rise, d.closing);
  const settle = lerp(Math.max(0, dy * 0.2), rise * 0.5, d.closing);

  return {
    x: bezier(inX, inX, fanX, fanX, k),
    y: bezier(inY, inY - climb, fanY + settle, fanY, k),
    rotate: lerp(inRotate, fanRotate, smoothstep(k)),
    scale: lerp(inScale, fanScale, k),
    opacity: lerp(appear, fanOpacity, k),
    zIndex: 100 - Math.round(a * 10),
    out: k,
  };
}
