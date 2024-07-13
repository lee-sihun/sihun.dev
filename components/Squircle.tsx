import React, { useMemo } from "react";

interface SquircleProps {
  radius?: number;
  color?: string;
  className?: string;
  children?: React.ReactNode;
}

const Squircle: React.FC<SquircleProps> = ({
  radius = 0,
  className,
  children,
}) => {
  const generateSquircle = useMemo(() => {
    // const normalizedRadius = Math.max(radius, 1); // 1 미만의 값만 방지
    // const power = Math.max(0.01, 2.5 - normalizedRadius / 50); // power가 0이 되는 것을 방지
    const power = radius;
    const points = 1000; // Increase points for smoother curve

    const squircle = (theta: number) => ({
      x:
        Math.pow(Math.abs(Math.cos(theta)), power) *
          50 *
          Math.sign(Math.cos(theta)) +
        50,
      y:
        Math.pow(Math.abs(Math.sin(theta)), power) *
          50 *
          Math.sign(Math.sin(theta)) +
        50,
    });

    return Array.from(
      { length: points },
      (_, i) => i * ((Math.PI * 2) / points)
    )
      .map(squircle)
      .map(({ x, y }) => `${x.toFixed(3)}% ${y.toFixed(3)}%`)
      .join(", ");
  }, [radius]);

  const clipPath = `polygon(${generateSquircle})`;

  return (
    <div
      className={`${className}`}
      style={{
        clipPath: clipPath,
      }}
    >
      {children}
    </div>
  );
};

export default Squircle;
