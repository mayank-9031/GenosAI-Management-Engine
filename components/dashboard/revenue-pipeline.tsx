"use client";

import { TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { computePipeline } from "@/lib/store/selectors";
import { Card } from "@/components/ui/card";
import { AreaTrend } from "@/components/charts/charts";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { SectionTitle, Trend } from "@/components/shared/bits";
import { formatCurrency } from "@/lib/utils";

export function RevenuePipeline() {
  const leads = useStore((s) => s.leads);
  const series = useStore((s) => s.series.revenue);
  const { current, forecast, growth } = computePipeline(leads);

  return (
    <Card className="p-5">
      <SectionTitle hint="Last 12 months">Revenue Pipeline</SectionTitle>

      <div className="grid grid-cols-3 gap-3">
        <Metric label="Current Pipeline" value={current} accent="text-foreground" />
        <Metric label="Forecast Revenue" value={forecast} accent="text-primary" />
        <div className="rounded-lg border border-border bg-secondary/30 p-3">
          <p className="text-[11px] text-muted-foreground">Monthly Growth</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="tabular text-lg font-semibold text-success">+{growth}%</span>
            <TrendingUp className="size-4 text-success" />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-1" /> Closed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-chart-2" /> Forecast
            </span>
          </div>
          <Trend value={growth} />
        </div>
        <AreaTrend
          data={series}
          height={210}
          series={[
            { key: "closed", label: "Closed", color: "var(--chart-1)" },
            { key: "forecast", label: "Forecast", color: "var(--chart-2)" },
          ]}
          formatter={(v) => `$${v}k`}
        />
      </div>
    </Card>
  );
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <AnimatedNumber
        value={value}
        format={(n) => formatCurrency(n, true)}
        className={`tabular mt-1.5 block text-lg font-semibold ${accent}`}
      />
    </div>
  );
}
