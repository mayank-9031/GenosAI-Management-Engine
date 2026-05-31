"use client";

import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AnimatedNumber } from "./animated-number";
import { Trend } from "./bits";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  format?: (n: number) => string;
  trend?: number;
  accent?: "primary" | "info" | "violet" | "warning" | "danger" | "success";
  live?: boolean;
}

const ACCENT: Record<string, string> = {
  primary: "text-primary",
  info: "text-info",
  violet: "text-violet",
  warning: "text-warning",
  danger: "text-danger",
  success: "text-success",
};

export function KpiCard({
  label,
  value,
  icon: Icon,
  format,
  trend,
  accent = "primary",
  live,
}: KpiCardProps) {
  return (
    <Card className="glass-hover relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full opacity-[0.12] blur-2xl"
        style={{ background: `var(--${accent})` }}
      />
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={cn("rounded-lg border border-border bg-secondary/60 p-1.5", ACCENT[accent])}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <AnimatedNumber
          value={value}
          format={format}
          className="tabular text-[26px] font-semibold leading-none"
        />
        {live && (
          <span className="flex items-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span className="live-dot size-1.5 rounded-full bg-success" />
          </span>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-2">
          <Trend value={trend} />
          <span className="text-[11px] text-muted-foreground">vs last week</span>
        </div>
      )}
    </Card>
  );
}
