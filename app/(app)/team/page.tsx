"use client";

import { useStore } from "@/lib/store/store";
import { leaderboard } from "@/lib/store/selectors";
import { PageHeader, SectionTitle } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BarTrend } from "@/components/charts/charts";
import { FadeIn, Reveal, Stagger } from "@/components/shared/motion";
import { formatCurrency, initials } from "@/lib/utils";

export default function TeamPage() {
  const agents = useStore((s) => s.agents);
  const ranked = leaderboard(agents);
  const maxRevenue = ranked[0]?.revenueGenerated || 1;

  const chartData = ranked.map((a) => ({
    label: a.name.split(" ")[0],
    revenue: Math.round(a.revenueGenerated / 1000),
    deals: a.dealsClosed,
  }));

  const medal = ["#f5b13d", "#c0c7d1", "#cd7f47"];

  return (
    <div>
      <PageHeader title="Team Management" subtitle="Performance, leaderboard, and revenue by agent." />

      {/* Leaderboard */}
      <FadeIn className="mb-4">
        <Card className="p-5">
          <SectionTitle hint="Ranked by revenue">Team Leaderboard</SectionTitle>
          <div className="space-y-2">
            {ranked.map((a, i) => (
              <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                <span
                  className="tabular flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{
                    background: i < 3 ? `${medal[i]}22` : "var(--secondary)",
                    color: i < 3 ? medal[i] : "var(--muted-foreground)",
                  }}
                >
                  {i + 1}
                </span>
                <Avatar label={initials(a.name)} size={38} gradient={a.avatarGradient} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </div>
                <div className="hidden w-40 sm:block">
                  <Progress value={(a.revenueGenerated / maxRevenue) * 100} />
                </div>
                <div className="w-24 text-right">
                  <p className="tabular text-sm font-semibold text-primary">{formatCurrency(a.revenueGenerated, true)}</p>
                  <p className="text-[11px] text-muted-foreground">{a.conversionRate}% conv.</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      {/* Revenue chart */}
      <FadeIn delay={0.05} className="mb-4">
        <Card className="p-5">
          <SectionTitle hint="Revenue ($k) by agent">Revenue Comparison</SectionTitle>
          <BarTrend
            data={chartData}
            height={240}
            series={[{ key: "revenue", label: "Revenue ($k)", color: "var(--chart-1)" }]}
            formatter={(v) => `$${v}k`}
          />
        </Card>
      </FadeIn>

      {/* Agent cards */}
      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map((a) => (
          <Reveal key={a.id}>
            <Card className="glass-hover p-5">
              <div className="flex items-center gap-3">
                <Avatar label={initials(a.name)} size={44} gradient={a.avatarGradient} />
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.role}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Leads Assigned" value={a.leadsAssigned} />
                <Metric label="Calls Completed" value={a.callsCompleted} />
                <Metric label="Meetings Booked" value={a.meetingsBooked} />
                <Metric label="Deals Closed" value={a.dealsClosed} />
              </div>
              <div className="mt-3 rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">Revenue Generated</p>
                <p className="tabular mt-0.5 text-lg font-semibold text-primary">{formatCurrency(a.revenueGenerated)}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </Stagger>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="tabular text-lg font-semibold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
