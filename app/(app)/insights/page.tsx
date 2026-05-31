"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Clock3,
  Sparkles,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { computePipeline, leaderboard } from "@/lib/store/selectors";
import { PageHeader, SectionTitle } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { FadeIn, Reveal, Stagger } from "@/components/shared/motion";
import { useHydrated } from "@/lib/hooks";
import { formatCurrency, formatRelativeTime, initials } from "@/lib/utils";

const DAY = 86_400_000;

export default function InsightsPage() {
  const leads = useStore((s) => s.leads);
  const agents = useStore((s) => s.agents);
  const sources = useStore((s) => s.series.leadSources);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();

  const pipeline = computePipeline(leads);
  const topAgent = leaderboard(agents).sort((a, b) => b.conversionRate - a.conversionRate)[0];
  const topSource = [...sources].sort((a, b) => (b.value as number) - (a.value as number))[0];

  const forecast = [
    { label: "Next Month", value: Math.round(pipeline.forecast * 0.34), sub: "Projected close" },
    { label: "This Quarter", value: Math.round(pipeline.forecast * 0.78), sub: "3-month outlook" },
    { label: "Annual Run-Rate", value: Math.round(pipeline.forecast * 3.1), sub: "Extrapolated" },
  ];

  const stalled = leads
    .filter((l) => ["New", "Contacted"].includes(l.status) && now - l.lastActivityAt > 3 * DAY)
    .slice(0, 4);
  const atRisk = leads
    .filter((l) => ["Negotiation", "Appointment Scheduled"].includes(l.status) && now - l.lastActivityAt > 2 * DAY)
    .slice(0, 4);

  return (
    <div>
      <PageHeader title="AI Insights" subtitle="Strategic recommendations from your revenue engine." live />

      {/* Headline insights */}
      <Stagger className="mb-4 grid gap-4 lg:grid-cols-2">
        <Reveal>
          <Card className="relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Lead Source Insight</span>
            </div>
            <p className="mt-3 text-lg font-semibold">
              {topSource.label as string} generate your highest-quality leads
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {topSource.value as number} leads sourced — outperforming all other channels on qualification rate. Consider reallocating budget here.
            </p>
            <Link href="/analytics" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
              View analytics <ArrowUpRight className="size-3.5" />
            </Link>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="relative overflow-hidden p-5">
            <div className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-info/10 blur-2xl" />
            <div className="flex items-center gap-2 text-info">
              <Trophy className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Agent Insight</span>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Avatar label={initials(topAgent.name)} size={44} gradient={topAgent.avatarGradient} />
              <div>
                <p className="text-lg font-semibold">{topAgent.name} leads on conversion</p>
                <p className="text-sm text-muted-foreground">
                  {topAgent.conversionRate}% conversion · {formatCurrency(topAgent.revenueGenerated, true)} generated
                </p>
              </div>
            </div>
            <Link href="/team" className="mt-3 inline-flex items-center gap-1 text-sm text-info hover:underline">
              View team <ArrowUpRight className="size-3.5" />
            </Link>
          </Card>
        </Reveal>
      </Stagger>

      {/* Revenue forecast */}
      <FadeIn delay={0.05} className="mb-4">
        <Card className="p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="size-4 text-success" />
            <SectionTitle className="mb-0">Revenue Forecast</SectionTitle>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {forecast.map((f) => (
              <div key={f.label} className="rounded-lg border border-border bg-secondary/30 p-4">
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="tabular mt-1.5 text-2xl font-semibold text-primary">{formatCurrency(f.value, true)}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{f.sub}</p>
              </div>
            ))}
          </div>
        </Card>
      </FadeIn>

      {/* Risk detection */}
      <div className="grid gap-4 lg:grid-cols-2">
        <FadeIn delay={0.08}>
          <RiskCard
            title="Stalled Leads"
            icon={Clock3}
            tone="warning"
            empty="No stalled leads — great hygiene!"
            leads={stalled}
            now={now}
            hydrated={hydrated}
            reason="No contact in 3+ days"
          />
        </FadeIn>
        <FadeIn delay={0.12}>
          <RiskCard
            title="At-Risk Opportunities"
            icon={AlertTriangle}
            tone="danger"
            empty="No at-risk deals right now."
            leads={atRisk}
            now={now}
            hydrated={hydrated}
            reason="Active deal going cold"
          />
        </FadeIn>
      </div>
    </div>
  );
}

function RiskCard({
  title,
  icon: Icon,
  tone,
  leads,
  empty,
  now,
  hydrated,
  reason,
}: {
  title: string;
  icon: typeof Clock3;
  tone: "warning" | "danger";
  leads: { id: string; name: string; status: string; lastActivityAt: number }[];
  empty: string;
  now: number;
  hydrated: boolean;
  reason: string;
}) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`size-4 ${tone === "warning" ? "text-warning" : "text-danger"}`} />
        <SectionTitle className="mb-0">{title}</SectionTitle>
        <Badge variant={tone} className="ml-auto">{leads.length}</Badge>
      </div>
      {leads.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          {leads.map((l) => (
            <Link
              key={l.id}
              href={`/leads/${l.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5 transition-colors hover:border-border-strong"
            >
              <Avatar label={initials(l.name)} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {reason} · {hydrated ? formatRelativeTime(l.lastActivityAt, now) : ""}
                </p>
              </div>
              <StatusBadge value={l.status} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  );
}
