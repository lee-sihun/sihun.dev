import { getSvgPath } from "figma-squircle";

// 프로젝트의 Squircle 컴포넌트와 같은 figma-squircle 경로를 쓰되,
// 크기를 이미 알고 있는 요소는 ResizeObserver 없이 렌더 시점에 바로 계산한다
export function squirclePath(
  width: number,
  height: number,
  radius: number,
  smoothing = 0.6
) {
  return getSvgPath({
    width,
    height,
    cornerRadius: radius,
    cornerSmoothing: smoothing,
    preserveSmoothing: true,
  });
}

export const squircleClip = (width: number, height: number, radius: number) =>
  `path('${squirclePath(width, height, radius)}')`;
