"use client";

import { motion, type HTMLMotionProps } from "motion/react";

const easeOut = [0.22, 1, 0.36, 1] as const;

/** Staggered reveal container. Children using <Reveal> animate in sequence. */
export function Stagger({
  children,
  className,
  delay = 0,
  gap = 0.05,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  gap?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className,
  y = 14,
  ...props
}: { children: React.ReactNode; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easeOut } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Standalone fade/slide-in (not tied to a Stagger parent). */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 12,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: easeOut, delay }}
    >
      {children}
    </motion.div>
  );
}
