"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store/store";

/**
 * Boots the live simulation once on the client:
 *  - rebases the fixed-anchor seed onto the real clock,
 *  - ticks the clock every second (drives relative-time labels),
 *  - runs a simulation step on an interval (new leads, status advances, activity).
 */
export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const hydrateClock = useStore((s) => s.hydrateClock);
  const tickClock = useStore((s) => s.tickClock);
  const simulateStep = useStore((s) => s.simulateStep);

  useEffect(() => {
    let cancelled = false;
    let clock: ReturnType<typeof setInterval>;
    let sim: ReturnType<typeof setInterval>;

    (async () => {
      // Pull persisted state in now that we're on the client, then start the clock.
      await useStore.persist.rehydrate();
      if (cancelled) return;
      hydrateClock();
      clock = setInterval(tickClock, 1000);
      sim = setInterval(simulateStep, 4500);
    })();

    return () => {
      cancelled = true;
      clearInterval(clock);
      clearInterval(sim);
    };
  }, [hydrateClock, tickClock, simulateStep]);

  return <>{children}</>;
}
