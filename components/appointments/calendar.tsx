"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { agentName } from "@/lib/store/selectors";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionTitle, EmptyState } from "@/components/shared/bits";
import { useHydrated } from "@/lib/hooks";
import { cn, formatTime } from "@/lib/utils";
import type { Appointment } from "@/lib/types";

const DAY = 86_400_000;
const dayKey = (ts: number) => {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar() {
  const appts = useStore((s) => s.appointments);
  const agents = useStore((s) => s.agents);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const m = new Map<string, Appointment[]>();
    for (const a of appts) {
      const k = dayKey(a.start);
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(a);
    }
    return m;
  }, [appts]);

  const today = new Date(now);
  const todayKey = dayKey(now);

  // ── Month grid ──
  const monthCells = useMemo(() => {
    const y = today.getFullYear();
    const mo = today.getMonth();
    const first = new Date(y, mo, 1);
    const startOffset = first.getDay();
    const cells: { date: Date; inMonth: boolean }[] = [];
    const gridStart = new Date(y, mo, 1 - startOffset);
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart.getTime() + i * DAY);
      cells.push({ date: d, inMonth: d.getMonth() === mo });
    }
    return cells;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  // ── Week ──
  const weekDays = useMemo(() => {
    const start = new Date(now - today.getDay() * DAY);
    return Array.from({ length: 7 }, (_, i) => new Date(start.getTime() + i * DAY));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now]);

  const selected = selectedKey
    ? byDay.get(selectedKey) ?? []
    : byDay.get(todayKey) ?? [];

  const monthLabel = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="p-5 lg:col-span-2">
        <Tabs defaultValue="month">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle className="mb-0" hint={hydrated ? monthLabel : undefined}>
              Calendar
            </SectionTitle>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </div>

          {/* Month */}
          <TabsContent value="month">
            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((d) => (
                <div key={d} className="pb-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {d}
                </div>
              ))}
              {monthCells.map(({ date, inMonth }, i) => {
                const k = dayKey(date.getTime());
                const dayAppts = byDay.get(k) ?? [];
                const isToday = k === todayKey;
                const isSel = k === selectedKey;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedKey(k)}
                    className={cn(
                      "flex min-h-[68px] flex-col rounded-lg border p-1.5 text-left transition-colors",
                      inMonth ? "border-border bg-secondary/20" : "border-transparent opacity-40",
                      isSel && "border-primary/50 bg-primary/[0.06]",
                      isToday && !isSel && "border-primary/30",
                    )}
                  >
                    <span className={cn("tabular text-xs", isToday ? "font-semibold text-primary" : "text-muted-foreground")}>
                      {date.getDate()}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {dayAppts.slice(0, 2).map((a) => (
                        <div key={a.id} className="truncate rounded bg-chart-2/20 px-1 py-0.5 text-[9px] text-foreground/90">
                          {a.clientName.split(" ")[0]}
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <div className="text-[9px] text-muted-foreground">+{dayAppts.length - 2} more</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          {/* Week */}
          <TabsContent value="week">
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((d, i) => {
                const k = dayKey(d.getTime());
                const dayAppts = (byDay.get(k) ?? []).sort((a, b) => a.start - b.start);
                const isToday = k === todayKey;
                return (
                  <div key={i} className="min-h-[180px] rounded-lg border border-border bg-secondary/20 p-2">
                    <div className={cn("mb-2 text-center", isToday && "text-primary")}>
                      <p className="text-[10px] uppercase text-muted-foreground">{WEEKDAYS[d.getDay()]}</p>
                      <p className="tabular text-sm font-semibold">{d.getDate()}</p>
                    </div>
                    <div className="space-y-1">
                      {dayAppts.map((a) => (
                        <button
                          key={a.id}
                          onClick={() => setSelectedKey(k)}
                          className="w-full rounded-md border border-border bg-chart-2/15 px-1.5 py-1 text-left"
                        >
                          <p className="truncate text-[10px] font-medium">{a.clientName.split(" ")[0]}</p>
                          <p className="tabular text-[9px] text-muted-foreground">{hydrated ? formatTime(a.start) : ""}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Day */}
          <TabsContent value="day">
            <DayTimeline appts={(byDay.get(todayKey) ?? []).sort((a, b) => a.start - b.start)} hydrated={hydrated} />
          </TabsContent>
        </Tabs>
      </Card>

      {/* Selected day detail */}
      <Card className="p-5">
        <SectionTitle hint={`${selected.length} scheduled`}>
          {selectedKey === null || selectedKey === todayKey ? "Today" : "Selected Day"}
        </SectionTitle>
        {selected.length === 0 ? (
          <EmptyState title="No appointments" hint="Pick another day on the calendar." />
        ) : (
          <div className="space-y-2.5">
            {selected.sort((a, b) => a.start - b.start).map((a) => (
              <div key={a.id} className="rounded-lg border border-border bg-secondary/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{a.clientName}</p>
                  <StatusBadge value={a.status} />
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {a.type} · {hydrated ? formatTime(a.start) : ""} · {a.durationMin}m
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{agentName(agents, a.agentId)}</p>
                {a.summary && (
                  <div className="mt-2 space-y-1 rounded-md border border-border bg-background/40 p-2 text-xs">
                    <p className="flex items-center gap-1.5"><ClipboardList className="size-3 text-info" /> {a.summary.notes}</p>
                    <p className="flex items-center gap-1.5"><CheckCircle2 className="size-3 text-success" /> {a.summary.outcome}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function DayTimeline({ appts, hydrated }: { appts: Appointment[]; hydrated: boolean }) {
  if (appts.length === 0) return <EmptyState title="No appointments today" />;
  return (
    <div className="space-y-2">
      {appts.map((a) => (
        <div key={a.id} className="flex items-center gap-4 rounded-lg border border-border bg-secondary/30 p-3">
          <div className="tabular w-16 shrink-0 text-sm font-medium text-primary">
            {hydrated ? formatTime(a.start) : ""}
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex-1">
            <p className="text-sm font-medium">{a.clientName}</p>
            <p className="text-xs text-muted-foreground">{a.type} · {a.durationMin} min</p>
          </div>
          <StatusBadge value={a.status} />
        </div>
      ))}
    </div>
  );
}
