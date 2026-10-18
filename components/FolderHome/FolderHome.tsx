"use client";
import {
  animate,
  mix,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import CardDetail, { type CardFrame } from "./CardDetail";
import CardFace, { CARD_EMS } from "./CardFace";
import {
  FolderBack,
  FolderFront,
  FolderShadow,
  type FolderMotion,
} from "./GlassFolder";
import {
  cardPose,
  clamp,
  closeFolderProgress,
  DESIGN,
  folderPose,
  lerp,
  measure,
  smoothstep,
  wrapOffset,
  type Drivers,
  type Geometry,
} from "./geometry";
import Backdrop from "./Backdrop";
import styles from "./FolderHome.module.css";
import { playChime, playFlip, playFolder, playShut, playTick } from "./sound";
import type { FolderItem } from "./types";

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

// 카드가 이보다 적으면 원형으로 돌릴 때 빈자리가 보여서 목록을 반복해 채운다
const MIN_SLOTS = 7;

// 누르자마자 움직이기 시작해 약 0.6초 안에 넘치지 않고 멈춘다 (임계 감쇠 + 초기 속도)
const OPEN_SPRING = {
  type: "spring",
  stiffness: 90,
  damping: 19,
  restDelta: 0.0005,
} as const;
// 닫을 때는 폴더가 먼저 올라와 얕게 내려오는 카드를 받아 함께 가운데로 떠오른다.
// 0보다 조금 아래(-CLOSE_PAST)를 겨냥하고 0에 닿는 순간 멈춰, 스프링 끝의 미세한 꼬리 없이 약 0.47초에 끝난다
const CLOSE_SPRING = { type: "spring", stiffness: 100, damping: 18 } as const;
const CLOSE_PAST = 0.015;
// 닫을 때 올라오던 폴더가 카드를 받아 내는 지점. 여기서 '툭' 소리를 낸다
const SHUT_AT = 0.3;
const KICK = 1.6;
const DIAL_SPRING = { type: "spring", stiffness: 260, damping: 32 } as const;
const WHEEL_SPRING = { type: "spring", stiffness: 320, damping: 40 } as const;
const HOVER_SPRING = { type: "spring", stiffness: 260, damping: 22 } as const;
const LIFT_SPRING = { type: "spring", stiffness: 380, damping: 26 } as const;
const QUICK = { duration: 0.2 } as const;
// 카드 뽑기: 빠르게 돌다가 길게 감속하며 멈춘다
const SPIN = {
  duration: 2.6,
  ease: [0.22, 0.65, 0.18, 1] as [number, number, number, number],
};

const mod = (value: number, n: number) => ((value % n) + n) % n;

// 스페이스·엔터를 스스로 처리하는 요소 안에서 눌렸는지
const isControl = (target: EventTarget | null) =>
  target instanceof Element &&
  target.closest(
    "a[href], button, input, select, textarea, [role='switch'], [role='radio']"
  ) !== null;

// 키보드로 옮긴 포커스인지 (:focus-visible을 모르는 오래된 브라우저에서는 그렇다고 본다)
function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

interface DragState {
  id: number;
  startX: number;
  startP: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

interface DetailState {
  slot: number;
  closing: boolean;
}

export default function FolderHome({ items }: { items: FolderItem[] }) {
  const reduceMotion = useReducedMotion() ?? false;
  const cardsId = useId();

  const slots = useMemo(() => {
    const repeat = Math.max(1, Math.ceil(MIN_SLOTS / items.length));
    return Array.from(
      { length: items.length * repeat },
      (_, k) => k % items.length
    );
  }, [items.length]);
  const n = slots.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry>(() => measure(1280, 800));
  const geoRef = useRef(geo);

  const [isOpen, setIsOpen] = useState(false);
  const isOpenRef = useRef(false);
  const [focusItem, setFocusItem] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const detailRef = useRef(detail);
  detailRef.current = detail;

  const targetP = useRef(0);
  const dragRef = useRef<DragState | null>(null);
  const suppressClick = useRef(false);
  // 마우스로 카드를 누르면 포커스가 먼저 옮겨지는데, 이때는 다이얼을 돌리지 않는다
  const pointerPressed = useRef(false);
  const returnFocus = useRef<number | null>(null);
  const lastIndex = useRef(0);
  // 진행 중인 카드 뽑기를 구분한다. 다른 조작이 끼어들면 값이 바뀌어 뽑기 후속 동작이 취소된다
  const spinId = useRef(0);
  const pendingShuffle = useRef(false);

  // ───────── 모션 값 ─────────
  const t = useMotionValue(0);
  const closing = useMotionValue(0);
  const p = useMotionValue(0);
  const hover = useMotionValue(0);
  const enter = useMotionValue(0);
  const float = useMotionValue(0);
  const layoutVersion = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const mx = useSpring(pointerX, { stiffness: 80, damping: 18, mass: 0.7 });
  const my = useSpring(pointerY, { stiffness: 80, damping: 18, mass: 0.7 });

  const drivers = useTransform(
    [t, closing, p, hover, enter, float, layoutVersion],
    ([tv, cv, pv, hv, ev, fv]: number[]): Drivers => ({
      t: tv,
      closing: cv,
      p: pv,
      hover: hv,
      enter: ev,
      float: fv,
    })
  );
  const folder = useTransform(drivers, (d) => folderPose(d, geoRef.current));

  const folderMotion: FolderMotion = {
    x: useTransform(
      folder,
      (f) => f.x - (DESIGN.folderW * geoRef.current.u) / 2
    ),
    y: useTransform(
      folder,
      (f) => f.y - (DESIGN.folderH * geoRef.current.u) / 2
    ),
    scale: useTransform(folder, (f) => f.scale),
    tiltX: useTransform(
      [my, t],
      ([y, tv]: number[]) => -y * 8 * (1 - 0.7 * clamp(tv, 0, 1))
    ),
    tiltY: useTransform(
      [mx, t],
      ([x, tv]: number[]) => x * 10 * (1 - 0.7 * clamp(tv, 0, 1))
    ),
  };
  // 폴더 안에 있는 동안은 카드도 폴더와 같은 각도로 기울어야 한 덩어리처럼 보인다
  const cardsTiltX = useTransform(
    [my, t],
    ([y, tv]: number[]) => -y * 8 * (1 - clamp(tv, 0, 1))
  );
  const cardsTiltY = useTransform(
    [mx, t],
    ([x, tv]: number[]) => x * 10 * (1 - clamp(tv, 0, 1))
  );
  const cardsOriginY = useTransform(folder, (f) => f.y / geoRef.current.h);

  // 앞판은 열기 초반에 먼저 젖혀지고, 닫을 때는 폴더가 올라오는 동안 차츰 닫힌다
  const flap = useTransform([t, hover, closing], ([tv, hv, cv]: number[]) =>
    lerp(
      -7 * hv,
      -30 + 8 * hv,
      lerp(smoothstep(clamp(tv / 0.35, 0, 1)), closeFolderProgress(tv), cv)
    )
  );
  const sheenX = useTransform(mx, (x) => `${x * 14}%`);
  const captionY = useTransform(
    folder,
    (f) =>
      f.y +
      (DESIGN.folderH * geoRef.current.u * f.scale) / 2 +
      24 * geoRef.current.u
  );
  const captionOpacity = useTransform(
    [t, enter],
    ([tv, ev]: number[]) =>
      clamp(1 - tv * 2.5, 0, 1) * clamp((ev - 0.45) / 0.55, 0, 1)
  );
  const dialOpacity = useTransform(t, (tv) => clamp((tv - 0.55) / 0.35, 0, 1));
  const shadowOpacity = useTransform(enter, (e) => clamp(e * 1.8, 0, 1));

  // 카드가 넘어가는 동안에는 stage에 표시를 남겨 카드 레이어를 지금 크기로 고정한다
  // (FolderHome.module.css의 .stage[data-moving]). 멈추면 풀어서 제 크기로 한 번 다시 그린다
  const settleTimer = useRef(0);
  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  useMotionValueEvent(p, "change", (value) => {
    const index = Math.round(value);
    setFocusItem(slots[mod(index, n)]);
    if (index !== lastIndex.current) {
      lastIndex.current = index;
      if (isOpenRef.current) playTick();
    }
    const stage = stageRef.current;
    if (stage) {
      if (!("moving" in stage.dataset)) stage.dataset.moving = "";
      window.clearTimeout(settleTimer.current);
      settleTimer.current = window.setTimeout(() => {
        delete stage.dataset.moving;
      }, 150);
    }
  });

  // ───────── 화면 크기 ─────────
  useIsomorphicLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => {
      // 스타일이 잠깐 빠진 순간(개발 중 HMR 등)처럼 무대가 무너진 크기는 무시한다
      if (stage.clientWidth < 64 || stage.clientHeight < 64) return;
      const next = measure(stage.clientWidth, stage.clientHeight);
      geoRef.current = next;
      setGeo(next);
      layoutVersion.set(layoutVersion.get() + 1);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(stage);
    return () => observer.disconnect();
  }, [layoutVersion]);

  // ───────── 등장 · 둥실거림 · 기울기 ─────────
  useEffect(() => {
    const entrance = animate(
      enter,
      1,
      reduceMotion
        ? { duration: 0.3 }
        : { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
    );
    return () => entrance.stop();
  }, [enter, reduceMotion]);

  // 열려 있는 동안에는 보이지 않는 움직임이라 멈춰 둔다
  useEffect(() => {
    const rest = animate(float, 0, { duration: 0.5 });
    if (reduceMotion || isOpen) return () => rest.stop();

    let cancelled = false;
    let bob: ReturnType<typeof animate> | undefined;
    rest.then(() => {
      if (cancelled) return;
      bob = animate(float, [0, -1, 0], {
        duration: 6.5,
        repeat: Infinity,
        ease: "easeInOut",
      });
    });
    return () => {
      cancelled = true;
      rest.stop();
      bob?.stop();
    };
  }, [float, isOpen, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointerX.set((event.clientX / window.innerWidth - 0.5) * 2);
      pointerY.set((event.clientY / window.innerHeight - 0.5) * 2);
    };
    const onLeave = () => {
      pointerX.set(0);
      pointerY.set(0);
    };
    window.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [pointerX, pointerY, reduceMotion]);

  // ───────── 열고 닫기 · 다이얼 ─────────
  const goTo = useCallback(
    (target: number, velocity = 0) => {
      spinId.current += 1;
      targetP.current = target;
      animate(p, target, reduceMotion ? QUICK : { ...DIAL_SPRING, velocity });
    },
    [p, reduceMotion]
  );

  const nearest = useCallback(
    (slot: number) => Math.round(p.get() + wrapOffset(slot, p.get(), n)),
    [p, n]
  );

  // 폴더가 들뜨는 모습은 마우스를 폴더 위로 움직였거나 키보드로 포커스했을 때만 보인다.
  // 클릭이나 닫을 때 옮겨 온 포커스에는 반응하지 않아, 닫히면 처음 모습으로 돌아온다
  const hoverBy = useRef({ pointer: false, focus: false });
  const setHover = useCallback(
    (next: Partial<{ pointer: boolean; focus: boolean }>) => {
      Object.assign(hoverBy.current, next);
      const { pointer, focus } = hoverBy.current;
      animate(hover, pointer || focus ? 1 : 0, HOVER_SPRING);
    },
    [hover]
  );

  // 폴더가 가만히 있는 마우스 아래로 움직여 오면 브라우저가 같은 위치로 포인터 이벤트를 다시 보낸다.
  // 마지막 위치와 비교해 실제로 마우스를 움직였을 때만 들뜨게 한다
  const lastPointer = useRef({ x: NaN, y: NaN });
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  const pointerMoved = (event: { clientX: number; clientY: number }) =>
    event.clientX !== lastPointer.current.x ||
    event.clientY !== lastPointer.current.y;

  // 여는 움직임과 닫는 움직임을 바꾼다. 다 열리거나 닫힌 상태에서는 두 움직임의 자세가 같아 바로 바꾸고,
  // 움직이는 도중에 방향을 바꾸면 튀지 않게 잠깐에 걸쳐 바꾼다
  const setClosing = useCallback(
    (value: number) => {
      const tv = t.get();
      if (tv <= 0 || tv >= 1) closing.jump(value);
      else animate(closing, value, { duration: 0.2 });
    },
    [t, closing]
  );

  const openFolder = useCallback(() => {
    if (isOpenRef.current) return;
    isOpenRef.current = true;
    setIsOpen(true);
    playFolder(true);
    setClosing(0);
    setHover({ pointer: false });
    animate(
      t,
      1,
      reduceMotion
        ? QUICK
        : { ...OPEN_SPRING, velocity: Math.max(t.getVelocity(), KICK) }
    );
    // 키보드로 열었을 때 바로 카드 사이를 오갈 수 있도록
    requestAnimationFrame(() =>
      cardRefs.current[mod(Math.round(targetP.current), n)]?.focus({
        preventScroll: true,
      })
    );
  }, [t, n, reduceMotion, setClosing, setHover]);

  const closeFolder = useCallback(() => {
    if (!isOpenRef.current) return;
    isOpenRef.current = false;
    setIsOpen(false);
    playFolder(false);
    goTo(Math.round(targetP.current));
    setClosing(1);
    let shut = false;
    animate(t, reduceMotion ? 0 : -CLOSE_PAST, {
      ...(reduceMotion
        ? QUICK
        : { ...CLOSE_SPRING, velocity: Math.min(t.getVelocity(), -KICK) }),
      onUpdate: (value) => {
        if (!shut && value <= SHUT_AT) {
          shut = true;
          playShut();
        }
        if (value <= 0) t.jump(0);
      },
    });
    if (stageRef.current?.querySelector("[data-slot]:focus")) {
      hitRef.current?.focus({ preventScroll: true });
    }
    // 폴더가 마우스 아래에서 빠져나가고 포커스도 저절로 옮겨 온 것이라 들뜨지 않게 한다
    setHover({ pointer: false, focus: false });
  }, [goTo, t, reduceMotion, setClosing, setHover]);

  const goToItem = (itemIndex: number) => {
    const candidates = slots
      .map((value, slot) => ({ value, slot }))
      .filter(({ value }) => value === itemIndex);
    const best = candidates.reduce((a, b) =>
      Math.abs(wrapOffset(a.slot, p.get(), n)) <=
      Math.abs(wrapOffset(b.slot, p.get(), n))
        ? a
        : b
    );
    goTo(nearest(best.slot));
  };

  // ───────── 카드 상세 ─────────
  const openDetail = (slot: number) => {
    goTo(nearest(slot));
    playFlip();
    setDetail({ slot, closing: false });
  };

  const closeDetail = useCallback(() => {
    const current = detailRef.current;
    if (!current || current.closing) return;
    playFlip();
    setDetail({ ...current, closing: true });
  }, []);

  // 다이얼을 두 바퀴 넘게 돌려 아무 카드에서 멈춘 뒤 펼친다
  const spin = () => {
    const base = Math.round(p.get());
    const choices = slots
      .map((itemIndex, slot) => ({ itemIndex, slot }))
      .filter(
        ({ itemIndex, slot }) =>
          slot !== mod(base, n) && items[itemIndex].kind !== "settings"
      );
    const { slot } = choices[Math.floor(Math.random() * choices.length)];
    const target = base + n * 2 + mod(slot - base, n);
    const id = ++spinId.current;
    targetP.current = target;
    animate(p, target, reduceMotion ? QUICK : SPIN).then(() => {
      if (spinId.current !== id || !isOpenRef.current) return;
      playChime();
      window.setTimeout(() => {
        if (spinId.current === id && isOpenRef.current && !detailRef.current) {
          openDetail(slot);
        }
      }, 420);
    });
  };
  const spinRef = useRef(spin);
  spinRef.current = spin;

  const shuffle = useCallback(() => {
    pendingShuffle.current = true;
    closeDetail();
  }, [closeDetail]);

  const onDetailClosed = useCallback(() => {
    const shuffling = pendingShuffle.current;
    pendingShuffle.current = false;
    // 뽑기를 할 때는 설정 카드로 포커스를 돌려보내지 않는다 (포커스가 다이얼을 되돌려 놓으므로)
    returnFocus.current = shuffling ? null : (detailRef.current?.slot ?? null);
    setDetail(null);
    if (shuffling) spinRef.current();
  }, []);

  const getFrame = useCallback(
    (slot: number): CardFrame => {
      const g = geoRef.current;
      const pose = cardPose(slot, n, drivers.get(), g);
      const rect = stageRef.current?.getBoundingClientRect();
      return {
        cx: (rect?.left ?? 0) + pose.x,
        cy: (rect?.top ?? 0) + pose.y,
        width: g.cardW * pose.scale,
        rotate: pose.rotate,
      };
    },
    [drivers, n]
  );

  // 상세가 열려 있는 동안 뒤쪽 무대는 포커스·클릭을 받지 않는다
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.inert = detail !== null;
    if (detail === null && returnFocus.current !== null) {
      cardRefs.current[returnFocus.current]?.focus({ preventScroll: true });
      returnFocus.current = null;
    }
  }, [detail]);

  const onCardClick = (slot: number) => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    if (!isOpenRef.current) return;
    if (Math.abs(wrapOffset(slot, p.get(), n)) < 0.5) openDetail(slot);
    else goTo(nearest(slot));
  };

  // ───────── 입력: 키보드 · 휠 · 드래그 ─────────
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (detailRef.current) {
        if (event.key === "Escape") closeDetail();
        // 스페이스·엔터로 연 카드는 같은 키로 닫는다 (카드 안의 버튼·링크·스위치에서는 그 컨트롤을 누른다)
        if (
          (event.key === " " || event.key === "Enter") &&
          !event.repeat &&
          !isControl(event.target)
        ) {
          event.preventDefault();
          closeDetail();
        }
        return;
      }
      if (!isOpenRef.current) return;
      if (event.key === "Escape") {
        closeFolder();
        hitRef.current?.focus({ preventScroll: true });
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      event.preventDefault();
      const next =
        Math.round(targetP.current) + (event.key === "ArrowRight" ? 1 : -1);
      goTo(next);
      if (stageRef.current?.querySelector("[data-slot]:focus")) {
        cardRefs.current[mod(next, n)]?.focus({ preventScroll: true });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeDetail, closeFolder, goTo, n]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onWheel = (event: WheelEvent) => {
      if (!isOpenRef.current || detailRef.current) return;
      event.preventDefault();
      spinId.current += 1;
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const unit =
        event.deltaMode === 1
          ? 32
          : event.deltaMode === 2
            ? geoRef.current.w
            : 1;
      targetP.current += (delta * unit) / (geoRef.current.spacing * 1.1);
      animate(p, targetP.current, reduceMotion ? QUICK : WHEEL_SPRING);
      clearTimeout(settle);
      settle = setTimeout(() => goTo(Math.round(targetP.current)), 140);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      clearTimeout(settle);
    };
  }, [goTo, p, reduceMotion]);

  useEffect(() => {
    const release = () => {
      pointerPressed.current = false;
    };
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerPressed.current = true;
    suppressClick.current = false;
    if (!isOpenRef.current || detailRef.current || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-no-drag]")) return;
    spinId.current += 1;
    p.stop();
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startP: p.get(),
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      moved: false,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < 6) return;
      drag.moved = true;
      p.stop();
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(true);
    }
    const dt = event.timeStamp - drag.lastTime;
    if (dt > 0)
      drag.velocity = lerp(
        drag.velocity,
        (event.clientX - drag.lastX) / dt,
        0.7
      );
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    p.set(drag.startP - dx / geoRef.current.spacing);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    dragRef.current = null;
    // 눌러서 멈춘 다이얼은 가장 가까운 카드에 다시 맞춘다
    if (!drag.moved) {
      goTo(Math.round(p.get()));
      return;
    }
    suppressClick.current = true;
    setDragging(false);
    const { spacing } = geoRef.current;
    const current = p.get();
    // 손을 놓을 때의 속도만큼 조금 더 굴러간 뒤 가장 가까운 카드에 멈춘다
    const projected = clamp(
      current - (drag.velocity * 160) / spacing,
      current - 3,
      current + 3
    );
    goTo(Math.round(projected), (-drag.velocity * 1000) / spacing);
  };

  // ───────── 그리기 ─────────
  const about = items.find((item) => item.kind === "about");
  // 오로라 배경은 가운데 카드와 이웃 카드의 색을 따른다 (설정 카드의 회색은 건너뛴다)
  const auroraPalettes = [0, 1, -1, 2, -2]
    .map((offset) => items[mod(focusItem + offset, items.length)])
    .filter((item) => item.kind !== "settings")
    .slice(0, 3)
    .map((item) => item.palette);
  // 설정 카드의 배경 미리보기 속 폴더에도 지금 폴더와 같은 순서로 카드를 꽂는다
  const folderPalettes = [-3, -2, -1, 0, 1, 2, 3].map(
    (offset) => items[mod(focusItem + offset, items.length)].palette
  );
  const causticColors = [-2, -1, 0, 1, 2].map(
    (offset) => items[slots[mod(offset, n)]].palette.to
  );
  // 폴더 탭 안의 띠는 카드가 넘어가는 만큼 다음 카드 색으로 섞여 든다
  // (가운데 카드가 바뀐 뒤에 색을 바꾸면 넘기기가 끝난 다음에야 따라오는 것처럼 보인다)
  const markColor = (key: "from" | "to") => (value: number) => {
    const i = Math.floor(value);
    const a = items[slots[mod(i, n)]].palette[key];
    const b = items[slots[mod(i + 1, n)]].palette[key];
    return mix(a, b)(value - i);
  };
  const markFrom = useTransform(p, markColor("from"));
  const markTo = useTransform(p, markColor("to"));
  const { u } = geo;
  const openHalf = (DESIGN.folderH * DESIGN.openFolderScale * u) / 2;
  const detailItem = detail ? items[slots[detail.slot]] : null;

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      data-open={isOpen}
      data-dragging={dragging}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      // 이미지·링크를 끌어 옮기지 못하게 한다 (포털로 띄운 펼친 카드에서도 여기로 올라온다)
      onDragStart={(event) => event.preventDefault()}
    >
      <h1 className="sr-only">
        {about ? `${about.title} · ${about.subline}` : "sihun.dev"}
      </h1>

      <Backdrop palettes={auroraPalettes} />
      <FolderShadow
        motion={folderMotion}
        u={u}
        colors={causticColors}
        opacity={shadowOpacity}
      />
      <FolderBack
        motion={folderMotion}
        u={u}
        mark={{ from: markFrom, to: markTo }}
      />

      <motion.div
        id={cardsId}
        className={styles.cards}
        style={{
          rotateX: cardsTiltX,
          rotateY: cardsTiltY,
          originY: cardsOriginY,
          transformPerspective: 1000 * u,
        }}
        role="group"
        aria-label="소개와 프로젝트 카드"
      >
        {slots.map((itemIndex, slot) => (
          <CardSlot
            key={slot}
            ref={(el) => {
              cardRefs.current[slot] = el;
            }}
            slot={slot}
            count={n}
            item={items[itemIndex]}
            index={itemIndex}
            drivers={drivers}
            geoRef={geoRef}
            width={geo.cardW}
            height={geo.cardH}
            interactive={isOpen}
            current={isOpen && focusItem === itemIndex}
            hidden={detail?.slot === slot}
            onClick={() => onCardClick(slot)}
            onFocus={() => {
              if (isOpenRef.current && !pointerPressed.current) {
                goTo(nearest(slot));
              }
            }}
          />
        ))}
      </motion.div>

      <FolderFront motion={folderMotion} u={u} flap={flap} sheenX={sheenX} />

      <motion.button
        ref={hitRef}
        type="button"
        className={styles.hit}
        data-no-drag
        aria-expanded={isOpen}
        aria-controls={cardsId}
        aria-label={
          isOpen ? "폴더 닫기" : "폴더 열기: 소개와 프로젝트 둘러보기"
        }
        style={{
          x: folderMotion.x,
          y: folderMotion.y,
          scale: folderMotion.scale,
          width: DESIGN.folderW * u,
          height: DESIGN.folderH * u,
          fontSize: 16 * u,
        }}
        onClick={isOpen ? closeFolder : openFolder}
        onPointerEnter={(event) => {
          if (pointerMoved(event)) setHover({ pointer: true });
        }}
        // 이미 폴더 위에 있던 마우스는 enter가 다시 오지 않아 움직임으로 알아챈다
        onPointerMove={(event) => {
          if (!hoverBy.current.pointer && pointerMoved(event)) {
            setHover({ pointer: true });
          }
        }}
        onPointerLeave={() => setHover({ pointer: false })}
        onFocus={(event) =>
          setHover({ focus: isFocusVisible(event.currentTarget) })
        }
        onBlur={() => setHover({ focus: false })}
      />

      <motion.div
        className={styles.caption}
        style={{ y: captionY, opacity: captionOpacity, fontSize: 16 * u }}
        aria-hidden
      >
        <span className={styles.captionHint}>폴더를 눌러 열어보세요!</span>
      </motion.div>

      <motion.div
        className={styles.caption}
        style={{
          y: geo.fanY + geo.cardH / 2 + 26 * u,
          opacity: dialOpacity,
          fontSize: 16 * u,
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        <div className={styles.dots} data-no-drag>
          {items.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              className={styles.dot}
              aria-label={`${item.title} 카드로 이동`}
              aria-current={focusItem === itemIndex}
              onClick={() => goToItem(itemIndex)}
            />
          ))}
        </div>
        <span className={styles.captionHint} aria-hidden>
          <span className={styles.forPointer}>
            드래그하거나 <kbd>←</kbd> <kbd>→</kbd> 로 넘기고, 카드를 눌러
            펼쳐보세요
          </span>
          <span className={styles.forTouch}>
            옆으로 넘기고, 카드를 눌러 펼쳐보세요
          </span>
        </span>
      </motion.div>

      <motion.div
        className={styles.caption}
        style={{
          y: geo.openY + openHalf + 10 * u,
          opacity: dialOpacity,
          fontSize: 16 * u,
        }}
        aria-hidden
      >
        <span className={styles.captionHint} style={{ marginTop: 0 }}>
          <span className={styles.forPointer}>
            폴더를 누르거나 <kbd>esc</kbd> 로 닫기
          </span>
          <span className={styles.forTouch}>폴더를 누르면 닫혀요</span>
        </span>
      </motion.div>

      {detail && detailItem && (
        <CardDetail
          item={detailItem}
          index={slots[detail.slot]}
          closing={detail.closing}
          cardW={geo.cardW}
          cardH={geo.cardH}
          viewport={geo}
          reduceMotion={reduceMotion}
          getFrame={() => getFrame(detail.slot)}
          onRequestClose={closeDetail}
          onClosed={onDetailClosed}
          onShuffle={shuffle}
          folderPalettes={folderPalettes}
        />
      )}
    </div>
  );
}

interface CardSlotProps {
  slot: number;
  count: number;
  item: FolderItem;
  index: number;
  drivers: MotionValue<Drivers>;
  geoRef: MutableRefObject<Geometry>;
  width: number;
  height: number;
  interactive: boolean;
  current: boolean;
  hidden: boolean;
  onClick: () => void;
  onFocus: () => void;
}

const CardSlot = forwardRef<HTMLButtonElement, CardSlotProps>(function CardSlot(
  {
    slot,
    count,
    item,
    index,
    drivers,
    geoRef,
    width,
    height,
    interactive,
    current,
    hidden,
    onClick,
    onFocus,
  },
  ref
) {
  const pose = useTransform(drivers, (d) =>
    cardPose(slot, count, d, geoRef.current)
  );
  const x = useTransform(pose, (s) => s.x - geoRef.current.cardW / 2);
  const y = useTransform(pose, (s) => s.y - geoRef.current.cardH / 2);
  const rotate = useTransform(pose, (s) => s.rotate);
  const scale = useTransform(pose, (s) => s.scale);
  const opacity = useTransform(pose, (s) => s.opacity);
  const zIndex = useTransform(pose, (s) => s.zIndex);
  const pointerEvents = useTransform(pose, (s): "none" | "auto" =>
    interactive && s.opacity > 0.05 ? "auto" : "none"
  );
  const shadow = useTransform(pose, (s) => s.out);
  // 마우스를 올리면 카드 자신의 위쪽(부채꼴 바깥) 방향으로 살짝 뽑혀 나온다
  const lift = useMotionValue(0);
  const liftY = useTransform(lift, (l) => -l * 12 * geoRef.current.u);

  return (
    <motion.button
      ref={ref}
      type="button"
      data-slot={slot}
      className={styles.cardSlot}
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
      aria-label={`${item.kicker} · ${item.title}`}
      aria-current={current || undefined}
      style={{
        x,
        y,
        rotate,
        scale,
        opacity,
        zIndex,
        pointerEvents,
        width,
        height,
        fontSize: width / CARD_EMS,
        visibility: hidden ? "hidden" : undefined,
      }}
      onClick={onClick}
      onFocus={onFocus}
      onPointerEnter={() => {
        if (interactive) animate(lift, 1, LIFT_SPRING);
      }}
      onPointerLeave={() => animate(lift, 0, LIFT_SPRING)}
    >
      <motion.span className={styles.cardLift} style={{ y: liftY }}>
        <motion.span
          className={styles.cardShadow}
          style={{ opacity: shadow }}
          aria-hidden
        />
        <CardFace item={item} index={index} width={width} height={height} />
      </motion.span>
    </motion.button>
  );
});
