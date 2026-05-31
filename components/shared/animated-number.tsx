"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** Eased count-up. SSR renders the final value (consistent), then animates from
 *  the previous value on the client after mount. */
export function AnimatedNumber({ value, format, duration = 1000, className }: Props) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(0); // start from 0 so the first paint counts up

  useEffect(() => {
    const from = prev.current;
    const delta = value - from;
    if (delta === 0) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + delta * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prev.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span className={className}>{format ? format(display) : Math.round(display).toLocaleString()}</span>;
}
