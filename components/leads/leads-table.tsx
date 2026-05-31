"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpDown, Search } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { agentName } from "@/lib/store/selectors";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/bits";
import { useHydrated } from "@/lib/hooks";
import { cn, formatCurrency, formatRelativeTime, initials } from "@/lib/utils";
import type { LeadStatus } from "@/lib/types";

const STATUS_OPTIONS = [
  "All", "New", "Contacted", "Qualified", "Appointment Scheduled", "Negotiation", "Won", "Lost",
];

type SortKey = "score" | "value" | "recent";

export function LeadsTable() {
  const leads = useStore((s) => s.leads);
  const agents = useStore((s) => s.agents);
  const now = useStore((s) => s.now);
  const hydrated = useHydrated();

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<SortKey>("recent");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    let r = leads.filter((l) => {
      const matchQ = !q || l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.location.toLowerCase().includes(q);
      const matchS = status === "All" || l.status === (status as LeadStatus);
      return matchQ && matchS;
    });
    r = [...r].sort((a, b) => {
      if (sort === "score") return b.score.overall - a.score.overall;
      if (sort === "value") return b.estimatedValue - a.estimatedValue;
      return b.lastActivityAt - a.lastActivityAt;
    });
    return r;
  }, [leads, query, status, sort]);

  return (
    <div className="glass rounded-xl">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, location…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STATUS_OPTIONS.map((s) => ({ label: s, value: s }))}
            className="w-44"
          />
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            options={[
              { label: "Most recent", value: "recent" },
              { label: "Highest score", value: "score" },
              { label: "Highest value", value: "value" },
            ]}
            className="w-40"
          />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Lead</TableHead>
            <TableHead className="hidden md:table-cell">Source</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Agent</TableHead>
            <TableHead className="hidden sm:table-cell">Last Activity</TableHead>
            <TableHead className="text-right">Est. Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((l) => {
            const agent = agents.find((a) => a.id === l.assignedAgentId);
            return (
              <TableRow key={l.id} className="cursor-pointer">
                <TableCell>
                  <Link href={`/leads/${l.id}`} className="flex items-center gap-3">
                    <Avatar label={initials(l.name)} size={34} gradient={agent?.avatarGradient} />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{l.email}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{l.source}</span>
                </TableCell>
                <TableCell>
                  <ScorePill value={l.score.overall} />
                </TableCell>
                <TableCell>
                  <StatusBadge value={l.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">{agentName(agents, l.assignedAgentId)}</span>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <span className="text-xs text-muted-foreground">
                    {hydrated ? formatRelativeTime(l.lastActivityAt, now) : ""}
                  </span>
                </TableCell>
                <TableCell className="tabular text-right text-sm font-medium">
                  {formatCurrency(l.estimatedValue)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {rows.length === 0 && <EmptyState title="No leads match your filters" hint="Try adjusting search or status." />}

      <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <ArrowUpDown className="size-3" /> {rows.length} leads
        </span>
        <span>Updated live</span>
      </div>
    </div>
  );
}

function ScorePill({ value }: { value: number }) {
  const color = value >= 75 ? "text-success" : value >= 50 ? "text-warning" : "text-danger";
  const bg = value >= 75 ? "bg-success" : value >= 50 ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-2">
      <span className={cn("tabular text-sm font-semibold", color)}>{value}</span>
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-secondary">
        <div className={cn("h-full rounded-full", bg)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
