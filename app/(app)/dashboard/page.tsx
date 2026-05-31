"use client";

import { useStore } from "@/lib/store/store";
import { KpiGrid } from "@/components/dashboard/kpi-grid";
import { RevenuePipeline } from "@/components/dashboard/revenue-pipeline";
import { LeadFunnel } from "@/components/dashboard/lead-funnel";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { Card } from "@/components/ui/card";
import { BarTrend, Donut } from "@/components/charts/charts";
import { PageHeader, SectionTitle } from "@/components/shared/bits";
import { FadeIn } from "@/components/shared/motion";

export default function DashboardPage() {
  const leadSources = useStore((s) => s.series.leadSources);
  const callsWeek = useStore((s) => s.series.callsWeek);
  const totalSources = leadSources.reduce((s, p) => s + (p.value as number), 0);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Real-time overview of your revenue engine."
        live
      />

      <div className="space-y-4">
        <KpiGrid />

        <div className="grid gap-4 lg:grid-cols-3">
          <FadeIn delay={0.05} className="lg:col-span-2">
            <RevenuePipeline />
          </FadeIn>
          <FadeIn delay={0.1}>
            <ActivityFeed />
          </FadeIn>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <FadeIn delay={0.05}>
            <LeadFunnel />
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="p-5">
              <SectionTitle hint="By channel">Lead Sources</SectionTitle>
              <Donut
                data={leadSources.map((s) => ({ label: s.label as string, value: s.value as number }))}
                centerValue={totalSources.toLocaleString()}
                centerLabel="Total leads"
                formatter={(v) => `${v}`}
              />
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
                {leadSources.slice(0, 6).map((s, i) => (
                  <div key={s.label as string} className="flex items-center gap-2 text-xs">
                    <span
                      className="size-2 rounded-full"
                      style={{ background: `var(--chart-${(i % 5) + 1})` }}
                    />
                    <span className="truncate text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="p-5">
              <SectionTitle hint="This week">AI Calls</SectionTitle>
              <BarTrend
                data={callsWeek}
                height={236}
                series={[
                  { key: "calls", label: "Calls", color: "var(--chart-2)" },
                  { key: "booked", label: "Booked", color: "var(--chart-1)" },
                ]}
              />
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}
