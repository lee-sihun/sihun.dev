"use client";
import { useState } from "react";

export default function ThemeSwitcher() {
  const [isRotated, setIsRotated] = useState(false);

  // 버튼 클릭 시 회전 상태를 업데이트하는 함수
  const toggleRotation = () => {
    setIsRotated(!isRotated);
  };

  // 조건부 스타일링을 위한 변수
  const innerCircleColor = isRotated ? "bg-black" : "bg-white";
  const outerCircleColor = isRotated ? "bg-white" : "bg-black";
  const halfCircleColor = isRotated ? "bg-white" : "bg-black";

  const transitionStyle = "transition-colors duration-300 ease-in-out";

  return (
    <div className="relative w-8 h-8" onClick={toggleRotation}>
      <div
        className={`w-8 h-8 rounded-[10px] ${transitionStyle} ${outerCircleColor}`}
      />
      <div
        className={`absolute top-1/2 left-1/2 w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 ${innerCircleColor}`}
      />
      <div
        className={`absolute top-1/2 left-1/2 w-[18px] h-[18px] rounded-full transform -translate-x-1/2 -translate-y-1/2 overflow-hidden transition-transform duration-300 ease-in-out ${
          isRotated ? "rotate-[-180deg]" : "rotate-[0deg]"
        } ${innerCircleColor}`}
      >
        <div
          className={`w-[18px] h-[18px] rounded-full ${halfCircleColor}`}
          style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0% 100%)" }}
        />
      </div>
    </div>
  );
}
