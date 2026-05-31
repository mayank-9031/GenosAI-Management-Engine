import {
  Agent,
  Appointment,
  Call,
  Lead,
  LeadStatus,
  Ticket,
} from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

const OPEN_STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Appointment Scheduled", "Negotiation",
];

export interface Kpis {
  newLeadsToday: number;
  qualifiedLeads: number;
  meetingsBooked: number;
  activeConversations: number;
  revenuePipeline: number;
  closedDeals: number;
  conversionRate: number;
  timeSavedHrs: number;
}

export function computeKpis(
  leads: Lead[],
  appointments: Appointment[],
  tickets: Ticket[],
  calls: Call[],
  now: number,
): Kpis {
  const dayStart = now - DAY;
  const newLeadsToday = leads.filter((l) => l.createdAt >= dayStart).length;
  const qualifiedLeads = leads.filter((l) =>
    ["Qualified", "Appointment Scheduled", "Negotiation", "Won"].includes(l.status),
  ).length;
  const meetingsBooked = appointments.filter((a) =>
    ["Pending", "Confirmed"].includes(a.status),
  ).length;
  const activeConversations = tickets.filter((t) =>
    ["Open", "AI Handling", "Escalated"].includes(t.status),
  ).length;
  const revenuePipeline = leads
    .filter((l) => OPEN_STATUSES.includes(l.status))
    .reduce((s, l) => s + l.estimatedValue, 0);
  const won = leads.filter((l) => l.status === "Won");
  const closedDeals = won.length;
  const decided = leads.filter((l) => l.status === "Won" || l.status === "Lost").length;
  const conversionRate = decided ? (won.length / decided) * 100 : 0;
  const timeSavedHrs = Math.round(calls.length * 0.4 + tickets.length * 0.25 + leads.length * 0.1);

  return {
    newLeadsToday,
    qualifiedLeads,
    meetingsBooked,
    activeConversations,
    revenuePipeline,
    closedDeals,
    conversionRate,
    timeSavedHrs,
  };
}

export interface FunnelStage {
  label: string;
  count: number;
  pct: number; // conversion from previous
}

export function computeFunnel(leads: Lead[]): FunnelStage[] {
  const captured = leads.length;
  const qualified = leads.filter((l) =>
    ["Qualified", "Appointment Scheduled", "Negotiation", "Won"].includes(l.status),
  ).length;
  const appts = leads.filter((l) =>
    ["Appointment Scheduled", "Negotiation", "Won"].includes(l.status),
  ).length;
  const closed = leads.filter((l) => l.status === "Won").length;

  const pct = (n: number, d: number) => (d ? Math.round((n / d) * 100) : 0);
  return [
    { label: "Leads Captured", count: captured, pct: 100 },
    { label: "Qualified", count: qualified, pct: pct(qualified, captured) },
    { label: "Appointments Booked", count: appts, pct: pct(appts, qualified) },
    { label: "Deals Closed", count: closed, pct: pct(closed, appts) },
  ];
}

export function computePipeline(leads: Lead[]) {
  const current = leads
    .filter((l) => OPEN_STATUSES.includes(l.status))
    .reduce((s, l) => s + l.estimatedValue, 0);
  const forecast = Math.round(current * 1.28);
  const growth = 18.4;
  return { current, forecast, growth };
}

export function leaderboard(agents: Agent[]): Agent[] {
  return [...agents].sort((a, b) => b.revenueGenerated - a.revenueGenerated);
}

export function agentName(agents: Agent[], id: string): string {
  return agents.find((a) => a.id === id)?.name ?? "Unassigned";
}

export function callStats(calls: Call[], now: number) {
  const dayStart = now - DAY;
  const today = calls.filter((c) => c.createdAt >= dayStart);
  const completed = calls.filter((c) => c.status === "Completed");
  const qualified = calls.filter((c) => c.outcome === "Qualified").length;
  const booked = calls.filter((c) => c.outcome === "Appointment Booked").length;
  const avgDuration = completed.length
    ? Math.round(completed.reduce((s, c) => s + c.durationSec, 0) / completed.length)
    : 0;
  const answered = calls.filter((c) => c.outcome !== "No Answer").length;
  const bookingRate = answered ? Math.round((booked / answered) * 100) : 0;
  return {
    callsToday: today.length,
    completed: completed.length,
    qualified,
    avgDuration,
    bookingRate,
  };
}

export function supportStats(tickets: Ticket[]) {
  const resolved = tickets.filter((t) => t.status === "Resolved");
  const escalated = tickets.filter((t) => t.status === "Escalated");
  const resolutionRate = tickets.length
    ? Math.round((resolved.length / tickets.length) * 100)
    : 0;
  const escalationRate = tickets.length
    ? Math.round((escalated.length / tickets.length) * 100)
    : 0;
  const avgResponse = tickets.length
    ? Math.round(tickets.reduce((s, t) => s + t.responseTimeSec, 0) / tickets.length)
    : 0;
  const rated = resolved.filter((t) => t.satisfaction);
  const csat = rated.length
    ? rated.reduce((s, t) => s + (t.satisfaction ?? 0), 0) / rated.length
    : 0;
  return { resolutionRate, escalationRate, avgResponse, csat: Math.round(csat * 20) };
}

export function statusCounts(leads: Lead[]): Record<LeadStatus, number> {
  const out = {
    New: 0, Contacted: 0, Qualified: 0, "Appointment Scheduled": 0,
    Negotiation: 0, Won: 0, Lost: 0,
  } as Record<LeadStatus, number>;
  for (const l of leads) out[l.status]++;
  return out;
}
