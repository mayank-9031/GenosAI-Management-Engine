"use client";

import Link from "next/link";
import { ArrowLeft, Bot, Sparkles, User } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { agentName } from "@/lib/store/selectors";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ScoreRing, SectionTitle, EmptyState } from "@/components/shared/bits";
import { FadeIn } from "@/components/shared/motion";
import { formatDate, formatDuration, formatTime, initials } from "@/lib/utils";

export function CallDetail({ id }: { id: string }) {
  const call = useStore((s) => s.calls.find((c) => c.id === id));
  const agents = useStore((s) => s.agents);

  if (!call) {
    return (
      <div>
        <Back />
        <Card className="mt-4"><EmptyState title="Call not found" /></Card>
      </div>
    );
  }

  return (
    <div>
      <Back />

      <FadeIn>
        <Card className="mt-4 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar label={initials(call.leadName)} size={52} />
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold tracking-tight">{call.leadName}</h1>
                  <StatusBadge value={call.outcome} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {formatDate(call.createdAt, true)} · {formatTime(call.createdAt)} · {formatDuration(call.durationSec)} · {agentName(agents, call.agentId)}
                </p>
              </div>
            </div>
            <Link href={`/leads/${call.leadId}`}>
              <Button variant="secondary">View Lead</Button>
            </Link>
          </div>
        </Card>
      </FadeIn>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {/* Transcript */}
        <FadeIn delay={0.05} className="lg:col-span-2">
          <Card className="p-5">
            <SectionTitle hint={`${call.transcript.length} lines`}>Transcript</SectionTitle>
            {call.transcript.length === 0 ? (
              <EmptyState title="No transcript" hint="The call was not answered." />
            ) : (
              <div className="space-y-3">
                {call.transcript.map((line, i) => {
                  const ai = line.speaker === "AI";
                  return (
                    <div key={i} className={`flex gap-3 ${ai ? "" : "flex-row-reverse"}`}>
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          ai ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {ai ? <Bot className="size-4" /> : <User className="size-4" />}
                      </span>
                      <div
                        className={`max-w-[78%] rounded-xl border px-3.5 py-2 text-sm ${
                          ai
                            ? "border-primary/20 bg-primary/[0.06]"
                            : "border-border bg-secondary/40"
                        }`}
                      >
                        <p className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                          {ai ? "AI Agent" : call.leadName.split(" ")[0]}
                        </p>
                        {line.text}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </FadeIn>

        {/* AI Analysis */}
        <FadeIn delay={0.1}>
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Sparkles className="size-4" />
              </span>
              <SectionTitle className="mb-0">AI Analysis</SectionTitle>
            </div>

            <div className="flex flex-col items-center gap-1 py-2">
              <ScoreRing value={call.leadScore} size={96} stroke={8} label="Score" />
              <span className="text-xs text-muted-foreground">Qualification Score</span>
            </div>

            <div className="mt-2 space-y-3">
              <Analysis label="Sentiment"><StatusBadge value={call.sentiment} /></Analysis>
              <Analysis label="Intent Detection">
                <span className="text-sm font-medium">{call.intent}</span>
              </Analysis>
              <div className="rounded-lg border border-primary/20 bg-primary/[0.06] p-3">
                <p className="mb-1 text-xs font-medium text-primary">Recommended Action</p>
                <p className="text-sm">{call.recommendedAction}</p>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

function Analysis({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function Back() {
  return (
    <Link href="/calling" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" /> Back to Calls
    </Link>
  );
}
