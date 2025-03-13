"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

type Star = {
  id: number;
  initialAngle: number; // 초기 각도
  radius: number; // 원의 반지름
  size: number; // 별 크기
  opacity: number; // 투명도
  speed: number; // 회전 속도 (별마다 다른 속도)
  trailLength: number; // 궤적 길이
  color: string; // 별 색상
};

const StarTrails: React.FC = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [rotation, setRotation] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);

  // 중앙점 계산 - 화면 크기 변경시에만 재계산
  const centerX = useMemo(() => {
    return typeof window !== "undefined" ? window.innerWidth / 2 : 0;
  }, [typeof window !== "undefined" && window.innerWidth]);

  const centerY = useMemo(() => {
    return typeof window !== "undefined" ? window.innerHeight : 0;
  }, [typeof window !== "undefined" && window.innerHeight]);

  // 스크롤 이벤트를 감지하여 rotation 값 업데이트
  useMotionValueEvent(scrollY, "change", (latest) => {
    // 스크롤 위치에 따라 0에서 360 사이의 값으로 매핑 (회전 각도)
    const newRotation = Math.min(Math.max(latest / 1000, 0), 1) * 360;
    setRotation(newRotation);
  });

  // 별들 생성
  useEffect(() => {
    if (typeof window === "undefined") return;

    const generateStars = () => {
      const newStars: Star[] = [];
      const count = 150; // 별의 개수

      // 별의 색상 변형을 위한 배열
      const starColors = [
        "#ffffff", // 흰색
        "#fffafa", // 연한 흰색
        "#f8f8ff", // 유령 흰색
        "#f0ffff", // 하늘색 흰색
        "#f5f5f5", // 연한 회색
        "#fbf8e6", // 연한 노랑
      ];

      for (let i = 0; i < count; i++) {
        // 전체 원 형태(360도)로 별 생성 (0도에서 360도까지)
        const initialAngle = Math.random() * Math.PI * 2;

        // 반지름은 화면 높이의 0.1배에서 1.3배 사이로 설정 (중앙 부분도 채움)
        const radius = (Math.random() * 1.2 + 0.1) * window.innerHeight;

        // 별 크기, 투명도, 속도, 궤적 길이 등의 속성 설정
        newStars.push({
          id: i,
          initialAngle,
          radius,
          size: Math.random() * 2 + 1, // 1~3px
          opacity: Math.random() * 0.7 + 0.3, // 0.3~1
          speed: Math.random() * 0.8 + 0.2, // 0.2~1 (속도 차이)
          trailLength: Math.floor(Math.random() * 20) + 10, // 궤적 길이 (10~30)
          color: starColors[Math.floor(Math.random() * starColors.length)],
        });
      }

      return newStars;
    };

    setStars(generateStars());

    // 화면 크기 변경 시 별 위치 재조정
    const handleResize = () => {
      setStars(generateStars());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 나머지 코드는 그대로 유지
  // ...existing code...

  // Canvas로 별과 궤적 렌더링 - 성능 최적화
  const renderAnimationFrame = (time: number) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { alpha: true });

      if (ctx) {
        // 화면 크기 설정 (고해상도 디스플레이 대응)
        const pixelRatio = window.devicePixelRatio || 1;
        if (
          canvas.width !== window.innerWidth * pixelRatio ||
          canvas.height !== window.innerHeight * pixelRatio
        ) {
          canvas.width = window.innerWidth * pixelRatio;
          canvas.height = window.innerHeight * pixelRatio;
          canvas.style.width = `${window.innerWidth}px`;
          canvas.style.height = `${window.innerHeight}px`;
          ctx.scale(pixelRatio, pixelRatio);
        }

        // 화면 지우기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 각 별과 궤적 그리기
        stars.forEach((star) => {
          // 별의 현재 각도 계산 (초기 각도 + 회전 각도 * 별의 속도)
          const currentAngle =
            star.initialAngle - ((rotation * Math.PI) / 180) * star.speed;

          // 별의 현재 위치 계산
          const starX = centerX + star.radius * Math.cos(currentAngle);
          const starY = centerY - star.radius * Math.sin(currentAngle);

          // 궤적 그리기
          for (let i = 0; i < star.trailLength; i++) {
            // 궤적의 각 포인트에 대한 각도 계산 (현재 각도에서 조금씩 이전 위치로)
            const trailAngle = currentAngle + i * 0.02;
            const trailX = centerX + star.radius * Math.cos(trailAngle);
            const trailY = centerY - star.radius * Math.sin(trailAngle);

            // 궤적의 투명도와 크기 계산 (별에서 멀어질수록 작아지고 투명해짐)
            const trailOpacity =
              star.opacity * Math.max(0.1, 1 - i / (star.trailLength * 0.7));
            const trailSize = Math.max(0.5, star.size * (1 - i * 0.04));

            // 궤적 점 그리기
            ctx.beginPath();
            ctx.arc(trailX, trailY, trailSize * 0.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity * 0.5})`;
            ctx.fill();

            // 빛나는 효과 추가 (더 넓은 그림자 효과)
            if (i < 5 || i % 3 === 0) {
              ctx.beginPath();
              ctx.arc(trailX, trailY, trailSize * 2, 0, Math.PI * 2);
              ctx.fillStyle = `rgba(255, 255, 255, ${trailOpacity * 0.15})`;
              ctx.fill();
            }
          }

          // 별 그리기 (가장 앞쪽 포인트)
          ctx.beginPath();
          ctx.arc(starX, starY, star.size, 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.fill();

          // 별 빛나는 효과 (내부 그라데이션)
          const glow = ctx.createRadialGradient(
            starX,
            starY,
            0,
            starX,
            starY,
            star.size * 4
          );
          glow.addColorStop(0, `rgba(255, 255, 255, ${star.opacity * 0.8})`);
          glow.addColorStop(0.5, `rgba(255, 255, 255, ${star.opacity * 0.3})`);
          glow.addColorStop(1, "rgba(255, 255, 255, 0)");

          ctx.beginPath();
          ctx.arc(starX, starY, star.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();

          // 별 자체에 추가 그로우 효과
          ctx.beginPath();
          ctx.arc(starX, starY, star.size * 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * 0.5})`;
          ctx.fill();
        });
      }
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(renderAnimationFrame);
  };

  // 애니메이션 프레임 설정 및 정리
  useEffect(() => {
    requestRef.current = requestAnimationFrame(renderAnimationFrame);
    return () => cancelAnimationFrame(requestRef.current);
  }, [stars, rotation, centerX, centerY]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default StarTrails;
