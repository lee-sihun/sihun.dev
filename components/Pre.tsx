"use client";
import React, { useState, useRef } from "react";
import { CopyButton } from "./CopyButton";

interface PreProps {
  children: React.ReactNode;
  raw: string;
  props?: React.HTMLAttributes<HTMLPreElement>;
}

export const Pre = ({ children, raw, ...props }: PreProps) => {
  const preRef = useRef<HTMLPreElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute flex items-center space-x-2 top-0 right-0 m-[11px]">
        <CopyButton preRef={preRef} isHoverd={isHovered} />
      </div>
      <pre {...props} ref={preRef}>
        {children}
      </pre>
    </div>
  );
};
