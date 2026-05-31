"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  CalendarPlus,
  CheckCircle2,
  PhoneOff,
  Sparkles,
  Trophy,
  UserPlus,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Card } from "@/components/ui/card";
import { LivePulse, SectionTitle } from "@/components/shared/bits";
import { useHydrated } from "@/lib/hooks";
import { formatRelativeTime } from "@/lib/utils";
import type { ActivityType } from "@/lib/types";

const ICON: Record<ActivityType, { icon: typeof UserPlus; color: string }> = {
  "Lead Created": { icon: UserPlus, color: "text-info" },
  "Lead Qualified": { icon: Sparkles, color: "text-primary" },
  "Appointment Scheduled": { icon: CalendarPlus, color: "text-warning" },
  "AI Call Completed": { icon: PhoneOff, color: "text-violet" },
  "Customer Inquiry Resolved": { icon: CheckCircle2, color: "text-info" },
  "Deal Closed": { icon: Trophy, color: "text-success" },
};

export function ActivityFeed({ limit = 12 }: { limit?: number }) {
  const activity = useStore((s) => s.activity);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="mb-3 flex items-center justify-between">
        <SectionTitle className="mb-0">Activity Feed</SectionTitle>
        <LivePulse label="Live" />
      </div>
      <div className="no-scrollbar -mr-2 max-h-[460px] flex-1 space-y-1 overflow-y-auto pr-2">
        <AnimatePresence initial={false}>
          {activity.slice(0, limit).map((a) => {
            const { icon: Icon, color } = ICON[a.type];
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-white/[0.025]"
              >
                <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/60 ${color}`}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                </div>
                <span className="shrink-0 text-[11px] text-muted-foreground/70">
                  {hydrated ? formatRelativeTime(a.at, now) : ""}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </Card>
  );
}
