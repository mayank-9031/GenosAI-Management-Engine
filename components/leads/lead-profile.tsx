"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Banknote,
  CalendarClock,
  Lightbulb,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Target,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { agentName } from "@/lib/store/selectors";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ScoreRing, SectionTitle, EmptyState } from "@/components/shared/bits";
import { Progress } from "@/components/ui/progress";
import { FadeIn } from "@/components/shared/motion";
import { useHydrated } from "@/lib/hooks";
import { formatCurrency, formatRelativeTime, initials } from "@/lib/utils";

export function LeadProfile({ id }: { id: string }) {
  const lead = useStore((s) => s.leads.find((l) => l.id === id));
  const agents = useStore((s) => s.agents);
  const allCalls = useStore((s) => s.calls);
  const allAppts = useStore((s) => s.appointments);
  const now = useStore((s) => s.now);
  const calls = useMemo(() => allCalls.filter((c) => c.leadId === id), [allCalls, id]);
  const appts = useMemo(() => allAppts.filter((a) => a.leadId === id), [allAppts, id]);
  const hydrated = useHydrated();

  if (!lead) {
    return (
      <div>
        <BackLink />
        <Card className="mt-4">
          <EmptyState title="Lead not found" hint="It may have been removed." />
        </Card>
      </div>
    );
  }

  const agent = agents.find((a) => a.id === lead.assignedAgentId);
  const scores = [
    { label: "Budget Fit", value: lead.score.budget },
    { label: "Urgency", value: lead.score.urgency },
    { label: "Engagement", value: lead.score.engagement },
    { label: "Intent", value: lead.score.intent },
  ];

  return (
    <div>
      <BackLink />

      <FadeIn>
        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar label={initials(lead.name)} size={56} gradient={agent?.avatarGradient} />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">{lead.name}</h1>
                  <StatusBadge value={lead.status} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {lead.source} · Assigned to {agentName(agents, lead.assignedAgentId)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="secondary">Log Call</Button>
              <Button>Book Meeting</Button>
            </div>
          </div>
        </Card>
      </FadeIn>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-4 lg:col-span-2">
          <FadeIn delay={0.05}>
            <Card className="p-5">
              <SectionTitle>Qualification Score</SectionTitle>
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <div className="flex flex-col items-center gap-1">
                  <ScoreRing value={lead.score.overall} size={104} stroke={9} label="Overall" />
                  <span className="text-xs text-muted-foreground">Overall Qualification</span>
                </div>
                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                  {scores.map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className="tabular font-medium">{s.value}</span>
                      </div>
                      <Progress value={s.value} className="mt-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <SectionTitle className="mb-0">AI Summary</SectionTitle>
              </div>
              <div className="space-y-3 text-sm">
                <SummaryRow icon={Target} label="Customer Goals" text={lead.aiSummary.goals} />
                <SummaryRow icon={Lightbulb} label="Pain Points" text={lead.aiSummary.painPoints} />
                <SummaryRow icon={Sparkles} label="Buying Intent" text={lead.aiSummary.buyingIntent} />
              </div>
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/[0.06] p-3">
                <p className="mb-2 text-xs font-medium text-primary">Recommended Next Actions</p>
                <ul className="space-y-1.5">
                  {lead.aiSummary.nextActions.map((a, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <span className="flex size-4 items-center justify-center rounded-full bg-primary/20 text-[10px] text-primary">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.15}>
            <Card className="p-5">
              <SectionTitle hint={`${calls.length} calls · ${appts.length} meetings`}>
                Activity History
              </SectionTitle>
              {calls.length === 0 && appts.length === 0 ? (
                <EmptyState title="No recorded activity yet" />
              ) : (
                <div className="space-y-2">
                  {calls.slice(0, 3).map((c) => (
                    <Link
                      key={c.id}
                      href={`/calling/${c.id}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm transition-colors hover:border-border-strong"
                    >
                      <span className="flex items-center gap-2">
                        <Phone className="size-4 text-violet" /> AI Call · {c.outcome}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {hydrated ? formatRelativeTime(c.createdAt, now) : ""}
                      </span>
                    </Link>
                  ))}
                  {appts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <CalendarClock className="size-4 text-warning" /> {a.type}
                      </span>
                      <StatusBadge value={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <FadeIn delay={0.08}>
            <Card className="p-5">
              <SectionTitle>Personal Information</SectionTitle>
              <div className="space-y-3">
                <InfoRow icon={Mail} label="Email" value={lead.email} />
                <InfoRow icon={Phone} label="Phone" value={lead.phone} />
                <InfoRow icon={MapPin} label="Location" value={lead.location} />
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.12}>
            <Card className="p-5">
              <SectionTitle>Qualification Data</SectionTitle>
              <div className="space-y-3">
                <InfoRow icon={Banknote} label="Budget" value={formatCurrency(lead.budget)} />
                <InfoRow icon={CalendarClock} label="Timeline" value={lead.timeline} />
                <InfoRow icon={Target} label="Purchase Intent" value={lead.purchaseIntent} />
                <InfoRow icon={Banknote} label="Financing" value={lead.financingNeeds} />
              </div>
              <div className="mt-4 rounded-lg border border-border bg-secondary/30 p-3">
                <p className="text-xs text-muted-foreground">Estimated Deal Value</p>
                <p className="tabular mt-1 text-2xl font-semibold text-primary">
                  {formatCurrency(lead.estimatedValue)}
                </p>
              </div>
            </Card>
          </FadeIn>
        </div>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/leads"
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" /> Back to Leads
    </Link>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, text }: { icon: typeof Mail; label: string; text: string }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
