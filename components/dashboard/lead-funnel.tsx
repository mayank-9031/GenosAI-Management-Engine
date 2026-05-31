"use client";

import { useStore } from "@/lib/store/store";
import { computeFunnel } from "@/lib/store/selectors";
import { Card } from "@/components/ui/card";
import { SectionTitle } from "@/components/shared/bits";
import { ArrowDown } from "lucide-react";

const COLORS = ["var(--chart-2)", "var(--chart-1)", "var(--chart-4)", "var(--chart-3)"];

export function LeadFunnel() {
  const leads = useStore((s) => s.leads);
  const stages = computeFunnel(leads);
  const max = stages[0]?.count || 1;

  return (
    <Card className="p-5">
      <SectionTitle hint="Conversion by stage">Lead Funnel</SectionTitle>
      <div className="space-y-1">
        {stages.map((s, i) => {
          const width = Math.max(12, (s.count / max) * 100);
          return (
            <div key={s.label}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="tabular font-medium">{s.count}</span>
              </div>
              <div className="mt-1.5 h-9 w-full overflow-hidden rounded-lg bg-secondary/40">
                <div
                  className="flex h-full items-center justify-end rounded-lg px-3 transition-all duration-700 ease-out"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${COLORS[i]}33, ${COLORS[i]})`,
                  }}
                >
                  <span className="tabular text-xs font-semibold text-white/95">{s.count}</span>
                </div>
              </div>
              {i < stages.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <span className="flex items-center gap-1 rounded-full border border-border bg-secondary/50 px-2 py-0.5 text-[10px] text-muted-foreground">
                    <ArrowDown className="size-3" />
                    {stages[i + 1].pct}% convert
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
