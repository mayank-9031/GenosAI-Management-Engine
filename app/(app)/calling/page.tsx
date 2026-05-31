"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { CheckCircle2, Clock, PhoneCall, Sparkles, Target } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { callStats } from "@/lib/store/selectors";
import { PageHeader } from "@/components/shared/bits";
import { KpiCard } from "@/components/shared/kpi-card";
import { Avatar } from "@/components/ui/avatar";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";
import { FadeIn, Reveal, Stagger } from "@/components/shared/motion";
import { useHydrated } from "@/lib/hooks";
import { formatDuration, formatRelativeTime, initials } from "@/lib/utils";

const OUTCOMES = ["All", "Qualified", "Follow-Up Needed", "Appointment Booked", "Unqualified", "No Answer"];

export default function CallingPage() {
  const calls = useStore((s) => s.calls);
  const agents = useStore((s) => s.agents);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();
  const [filter, setFilter] = useState("All");

  const stats = callStats(calls, now);
  const rows = useMemo(
    () => (filter === "All" ? calls : calls.filter((c) => c.outcome === filter)),
    [calls, filter],
  );

  return (
    <div>
      <PageHeader title="AI Calling" subtitle="Autonomous outbound qualification calls." live />

      <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        <Reveal><KpiCard label="Calls Today" value={stats.callsToday} icon={PhoneCall} accent="info" live /></Reveal>
        <Reveal><KpiCard label="Completed" value={stats.completed} icon={CheckCircle2} accent="primary" /></Reveal>
        <Reveal><KpiCard label="Qualified" value={stats.qualified} icon={Sparkles} accent="success" /></Reveal>
        <Reveal><KpiCard label="Avg Duration" value={stats.avgDuration} icon={Clock} accent="violet" format={(n) => formatDuration(n)} /></Reveal>
        <Reveal><KpiCard label="Booking Rate" value={stats.bookingRate} icon={Target} accent="warning" format={(n) => `${n}%`} /></Reveal>
      </Stagger>

      <FadeIn delay={0.1} className="mt-4">
        <div className="glass rounded-xl">
          <div className="flex items-center justify-between border-b border-border p-4">
            <h2 className="text-sm font-semibold">Call Logs</h2>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              options={OUTCOMES.map((o) => ({ label: o, value: o }))}
              className="w-48"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Contact</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead className="hidden sm:table-cell">Duration</TableHead>
                <TableHead className="hidden md:table-cell">Lead Score</TableHead>
                <TableHead className="hidden lg:table-cell">Sentiment</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => {
                const agent = agents.find((a) => a.id === c.agentId);
                return (
                  <TableRow key={c.id} className="cursor-pointer">
                    <TableCell>
                      <Link href={`/calling/${c.id}`} className="flex items-center gap-3">
                        <Avatar label={initials(c.leadName)} size={32} gradient={agent?.avatarGradient} />
                        <span className="text-sm font-medium">{c.leadName}</span>
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge value={c.outcome} /></TableCell>
                    <TableCell className="tabular hidden text-sm text-muted-foreground sm:table-cell">
                      {formatDuration(c.durationSec)}
                    </TableCell>
                    <TableCell className="tabular hidden text-sm font-medium md:table-cell">{c.leadScore}</TableCell>
                    <TableCell className="hidden lg:table-cell"><StatusBadge value={c.sentiment} /></TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {hydrated ? formatRelativeTime(c.createdAt, now) : ""}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </FadeIn>
    </div>
  );
}
