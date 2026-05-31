"use client";

import {
  CalendarCheck,
  CircleDollarSign,
  Clock,
  MessagesSquare,
  Percent,
  Trophy,
  UserCheck,
  Users,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { computeKpis } from "@/lib/store/selectors";
import { KpiCard } from "@/components/shared/kpi-card";
import { Reveal } from "@/components/shared/motion";
import { formatCurrency, formatNumber } from "@/lib/utils";

export function KpiGrid() {
  const leads = useStore((s) => s.leads);
  const appointments = useStore((s) => s.appointments);
  const tickets = useStore((s) => s.tickets);
  const calls = useStore((s) => s.calls);
  const now = useStore((s) => s.now);

  const k = computeKpis(leads, appointments, tickets, calls, now);

  const cards = [
    { label: "New Leads Today", value: k.newLeadsToday, icon: Users, accent: "info" as const, trend: 12.5, live: true },
    { label: "Qualified Leads", value: k.qualifiedLeads, icon: UserCheck, accent: "primary" as const, trend: 8.2 },
    { label: "Meetings Booked", value: k.meetingsBooked, icon: CalendarCheck, accent: "warning" as const, trend: 5.1 },
    { label: "Active Conversations", value: k.activeConversations, icon: MessagesSquare, accent: "violet" as const, live: true },
    { label: "Revenue Pipeline", value: k.revenuePipeline, icon: CircleDollarSign, accent: "success" as const, format: (n: number) => formatCurrency(n, true), trend: 18.4 },
    { label: "Closed Deals", value: k.closedDeals, icon: Trophy, accent: "primary" as const, trend: 9.7 },
    { label: "Conversion Rate", value: k.conversionRate, icon: Percent, accent: "info" as const, format: (n: number) => `${n.toFixed(1)}%`, trend: 3.4 },
    { label: "Time Saved", value: k.timeSavedHrs, icon: Clock, accent: "warning" as const, format: (n: number) => `${formatNumber(n)}h` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Reveal key={c.label}>
          <KpiCard {...c} />
        </Reveal>
      ))}
    </div>
  );
}
