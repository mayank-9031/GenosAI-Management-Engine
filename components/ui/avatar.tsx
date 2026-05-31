"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface GradientAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  gradient?: string;
  label: string;
  size?: number;
}

/** Lightweight gradient-initial avatar (no remote images in this demo). */
export function Avatar({
  gradient = "linear-gradient(135deg,#10d293,#0f766e)",
  label,
  size = 36,
  className,
  ...props
}: GradientAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold text-white/95 ring-1 ring-white/10",
        className,
      )}
      style={{
        background: gradient,
        width: size,
        height: size,
        fontSize: size * 0.36,
      }}
      {...props}
    >
      {label}
    </div>
  );
}
