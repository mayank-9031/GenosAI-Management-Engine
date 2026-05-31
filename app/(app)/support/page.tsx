"use client";

import { useState } from "react";
import { Bot, CheckCircle2, Clock, Headphones, TrendingUp, User, UserCog } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { supportStats } from "@/lib/store/selectors";
import { PageHeader, SectionTitle, EmptyState } from "@/components/shared/bits";
import { KpiCard } from "@/components/shared/kpi-card";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Reveal, Stagger, FadeIn } from "@/components/shared/motion";
import { useHydrated } from "@/lib/hooks";
import { cn, formatRelativeTime, formatTime, initials } from "@/lib/utils";
import type { SupportCategory } from "@/lib/types";

const CATEGORIES: ("All" | SupportCategory)[] = [
  "All", "Financing Questions", "Property Questions", "Scheduling Requests", "Technical Support", "General Inquiries",
];

export default function SupportPage() {
  const tickets = useStore((s) => s.tickets);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();
  const stats = supportStats(tickets);

  const [cat, setCat] = useState<"All" | SupportCategory>("All");
  const [activeId, setActiveId] = useState(tickets[0]?.id ?? null);

  const filtered = cat === "All" ? tickets : tickets.filter((t) => t.category === cat);
  const active = tickets.find((t) => t.id === activeId) ?? filtered[0] ?? null;

  return (
    <div>
      <PageHeader title="Customer Support" subtitle="AI-handled inquiries with human escalation." live />

      <Stagger className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Reveal><KpiCard label="Resolution Rate" value={stats.resolutionRate} icon={CheckCircle2} accent="success" format={(n) => `${n}%`} /></Reveal>
        <Reveal><KpiCard label="Avg Response" value={stats.avgResponse} icon={Clock} accent="info" format={(n) => `${n}s`} /></Reveal>
        <Reveal><KpiCard label="Escalation Rate" value={stats.escalationRate} icon={TrendingUp} accent="warning" format={(n) => `${n}%`} /></Reveal>
        <Reveal><KpiCard label="Satisfaction" value={stats.csat} icon={Headphones} accent="violet" format={(n) => `${n}%`} /></Reveal>
      </Stagger>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Inbox */}
        <FadeIn delay={0.05}>
          <Card className="flex h-full flex-col p-0">
            <div className="border-b border-border p-4">
              <SectionTitle className="mb-2">Support Inbox</SectionTitle>
              <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setCat(c)}
                    className={cn(
                      "whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] transition-colors",
                      cat === c ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {c === "All" ? "All" : c.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>
            <div className="no-scrollbar max-h-[520px] flex-1 overflow-y-auto p-2">
              {filtered.length === 0 && <EmptyState title="No tickets" />}
              {filtered.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveId(t.id)}
                  className={cn(
                    "mb-1 flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors",
                    active?.id === t.id ? "bg-secondary" : "hover:bg-secondary/50",
                  )}
                >
                  <Avatar label={initials(t.customerName)} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{t.customerName}</p>
                      <span className="shrink-0 text-[10px] text-muted-foreground">
                        {hydrated ? formatRelativeTime(t.updatedAt, now) : ""}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{t.subject}</p>
                    <div className="mt-1"><StatusBadge value={t.status} /></div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Conversation */}
        <FadeIn delay={0.1} className="lg:col-span-2">
          <Card className="flex h-full min-h-[560px] flex-col p-0">
            {!active ? (
              <EmptyState title="Select a conversation" />
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-border p-4">
                  <div className="flex items-center gap-3">
                    <Avatar label={initials(active.customerName)} size={40} />
                    <div>
                      <p className="text-sm font-medium">{active.customerName}</p>
                      <p className="text-xs text-muted-foreground">{active.category}</p>
                    </div>
                  </div>
                  <StatusBadge value={active.status} />
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                  {active.messages.map((m, i) => {
                    const customer = m.sender === "Customer";
                    return (
                      <div key={i} className={cn("flex gap-3", customer ? "" : "flex-row-reverse")}>
                        <span
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg",
                            m.sender === "AI" && "bg-primary/15 text-primary",
                            m.sender === "Human" && "bg-info/15 text-info",
                            m.sender === "Customer" && "bg-secondary text-muted-foreground",
                          )}
                        >
                          {m.sender === "AI" ? <Bot className="size-4" /> : m.sender === "Human" ? <UserCog className="size-4" /> : <User className="size-4" />}
                        </span>
                        <div className={cn("max-w-[75%]")}>
                          <div
                            className={cn(
                              "rounded-xl border px-3.5 py-2 text-sm",
                              customer ? "border-border bg-secondary/40" : m.sender === "AI" ? "border-primary/20 bg-primary/[0.06]" : "border-info/20 bg-info/[0.06]",
                            )}
                          >
                            {m.text}
                          </div>
                          <p className={cn("mt-1 text-[10px] text-muted-foreground", customer ? "" : "text-right")}>
                            {m.sender} · {hydrated ? formatTime(m.at) : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border p-3">
                  <div className="flex items-center gap-2">
                    <Input placeholder="Type a reply… (demo)" disabled />
                    <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground opacity-60" disabled>
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
