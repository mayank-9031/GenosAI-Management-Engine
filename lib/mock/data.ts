import {
  Agent,
  Appointment,
  AppointmentStatus,
  ActivityEvent,
  Call,
  CallOutcome,
  Integration,
  Lead,
  LeadSource,
  LeadStatus,
  NotificationItem,
  Property,
  PropertyStatus,
  Sentiment,
  SeriesPoint,
  SupportCategory,
  Ticket,
  TicketStatus,
  TranscriptLine,
} from "@/lib/types";
import { makeRng, pick, int, float, sample, bool, type Rng } from "./random";

// Fixed anchor so SSR and first client render match. RealtimeProvider rebases
// to the real clock on mount (see store.hydrateClock).
export const BASE_TIME = 1_717_300_000_000;
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const FIRST = [
  "Sarah", "Marcus", "Elena", "David", "Priya", "James", "Olivia", "Daniel",
  "Sofia", "Ethan", "Maya", "Lucas", "Aisha", "Noah", "Chloe", "Ryan",
  "Isabella", "Liam", "Zoe", "Caleb", "Nina", "Andre", "Grace", "Tobias",
];
const LAST = [
  "Johnson", "Reyes", "Whitfield", "Chen", "Patel", "Okafor", "Nguyen",
  "Romano", "Larsson", "Bennett", "Castillo", "Ferreira", "Khan", "Sullivan",
  "Adebayo", "Petrov", "Hughes", "Moreau", "Kim", "Walsh",
];
const CITIES = [
  "Austin, TX", "Denver, CO", "Miami, FL", "Seattle, WA", "Phoenix, AZ",
  "Nashville, TN", "Charlotte, NC", "Portland, OR", "San Diego, CA", "Tampa, FL",
];
const SOURCES: LeadSource[] = [
  "Facebook Ads", "Google Ads", "Website", "Referral", "Cold Outreach", "Zillow", "Webinar",
];
const TIMELINES = ["Immediately", "1–3 months", "3–6 months", "6–12 months", "Exploring"];
const FINANCING = ["Pre-approved", "Needs financing", "Cash buyer", "Exploring options"];
const GRADIENTS = [
  "linear-gradient(135deg,#0f766e,#10d293)",
  "linear-gradient(135deg,#1e3a8a,#45b6fe)",
  "linear-gradient(135deg,#4c1d95,#9d7bff)",
  "linear-gradient(135deg,#7c2d12,#f5b13d)",
  "linear-gradient(135deg,#831843,#f4435f)",
  "linear-gradient(135deg,#0c4a6e,#38bdf8)",
];

const name = (rng: Rng) => `${pick(rng, FIRST)} ${pick(rng, LAST)}`;
const emailFor = (n: string) =>
  `${n.toLowerCase().replace(/[^a-z]/g, ".").replace(/\.+/g, ".")}@${pick(
    makeRng(n.length * 7 + 3),
    ["gmail.com", "outlook.com", "proton.me", "company.io"],
  )}`;
const phone = (rng: Rng) =>
  `+1 (${int(rng, 200, 989)}) ${int(rng, 200, 989)}-${int(rng, 1000, 9999)}`;

function buildAgents(): Agent[] {
  const defs: Array<[string, string, string]> = [
    ["Sarah Johnson", "Senior Sales Lead", "linear-gradient(135deg,#10d293,#0f766e)"],
    ["Marcus Reyes", "Account Executive", "linear-gradient(135deg,#45b6fe,#1e3a8a)"],
    ["Elena Whitfield", "Sales Specialist", "linear-gradient(135deg,#9d7bff,#4c1d95)"],
    ["David Chen", "Account Executive", "linear-gradient(135deg,#f5b13d,#7c2d12)"],
    ["Priya Patel", "Sales Specialist", "linear-gradient(135deg,#f4435f,#831843)"],
    ["James Okafor", "Junior Rep", "linear-gradient(135deg,#38bdf8,#0c4a6e)"],
  ];
  const rng = makeRng(101);
  return defs.map(([n, role, g], i) => {
    // Sarah leads the board (PRD reference).
    const factor = i === 0 ? 1 : 1 - i * 0.12;
    const deals = Math.round(int(rng, 9, 16) * factor);
    return {
      id: `agent-${i + 1}`,
      name: n,
      role,
      avatarGradient: g,
      leadsAssigned: Math.round(int(rng, 30, 52) * factor),
      callsCompleted: Math.round(int(rng, 60, 120) * factor),
      meetingsBooked: Math.round(int(rng, 18, 34) * factor),
      dealsClosed: deals,
      revenueGenerated: Math.round(deals * int(rng, 38000, 72000)),
      conversionRate: float(rng, i === 0 ? 34 : 18, i === 0 ? 41 : 30, 1),
    };
  });
}

function scoreFor(rng: Rng, status: LeadStatus) {
  const base =
    status === "Won" ? 82 :
    status === "Negotiation" ? 76 :
    status === "Appointment Scheduled" ? 70 :
    status === "Qualified" ? 64 :
    status === "Contacted" ? 48 :
    status === "Lost" ? 30 : 38;
  const j = (lo: number, hi: number) => Math.round(base + float(rng, lo, hi, 0));
  const budget = Math.max(5, Math.min(99, j(-12, 16)));
  const urgency = Math.max(5, Math.min(99, j(-16, 14)));
  const engagement = Math.max(5, Math.min(99, j(-10, 18)));
  const intent = Math.max(5, Math.min(99, j(-14, 16)));
  const overall = Math.round((budget + urgency + engagement + intent) / 4);
  return { budget, urgency, engagement, intent, overall };
}

const STATUSES: LeadStatus[] = [
  "New", "Contacted", "Qualified", "Appointment Scheduled", "Negotiation", "Won", "Lost",
];
const STATUS_WEIGHTS = [22, 20, 18, 14, 10, 9, 7];

function weightedStatus(rng: Rng): LeadStatus {
  const total = STATUS_WEIGHTS.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < STATUSES.length; i++) {
    if ((r -= STATUS_WEIGHTS[i]) <= 0) return STATUSES[i];
  }
  return "New";
}

function aiSummary(rng: Rng, n: string, intent: "High" | "Medium" | "Low") {
  const goals = pick(rng, [
    `${n.split(" ")[0]} is seeking a primary residence with strong appreciation potential.`,
    `Looking to relocate within the quarter and wants a turnkey property.`,
    `Investor profile — prioritizing rental yield and low maintenance.`,
    `Upgrading from a starter home; needs more space for a growing family.`,
  ]);
  const pain = pick(rng, [
    "Frustrated by slow responses from previous agents.",
    "Uncertain about current financing options and rates.",
    "Limited inventory matching their criteria so far.",
    "Tight timeline due to a lease ending soon.",
  ]);
  const buying =
    intent === "High"
      ? "Strong buying signals — actively comparing specific listings."
      : intent === "Medium"
      ? "Moderate intent — engaged but still evaluating budget."
      : "Early stage — gathering information, low urgency.";
  const actions = sample(
    rng,
    [
      "Schedule a discovery call within 24h",
      "Send 3 curated listings matching budget",
      "Connect with financing partner",
      "Book a property viewing",
      "Share neighbourhood market report",
      "Follow up with a personalized video",
    ],
    int(rng, 2, 3),
  );
  return { goals, painPoints: pain, buyingIntent: buying, nextActions: actions };
}

function buildLeads(rng: Rng, agents: Agent[]): Lead[] {
  const N = 46;
  const leads: Lead[] = [];
  for (let i = 0; i < N; i++) {
    const n = name(rng);
    const status = weightedStatus(rng);
    const intent: Lead["purchaseIntent"] = pick(rng, ["High", "Medium", "Low"]);
    const createdAt = BASE_TIME - int(rng, 0, 30) * DAY - int(rng, 0, 23) * HOUR;
    const lastActivityAt = Math.min(
      BASE_TIME - int(rng, 2, 600) * MIN,
      createdAt + int(rng, 1, 40) * HOUR,
    );
    const budget = int(rng, 250, 1400) * 1000;
    leads.push({
      id: `lead-${i + 1}`,
      name: n,
      email: emailFor(n),
      phone: phone(rng),
      location: pick(rng, CITIES),
      source: pick(rng, SOURCES),
      status,
      score: scoreFor(rng, status),
      assignedAgentId: pick(rng, agents).id,
      estimatedValue: Math.round(budget * float(rng, 0.04, 0.07, 3)),
      budget,
      timeline: pick(rng, TIMELINES),
      purchaseIntent: intent,
      financingNeeds: pick(rng, FINANCING),
      aiSummary: aiSummary(rng, n, intent),
      createdAt,
      lastActivityAt,
    });
  }
  return leads.sort((a, b) => b.lastActivityAt - a.lastActivityAt);
}

function transcriptFor(rng: Rng, leadName: string, start: number): TranscriptLine[] {
  const first = leadName.split(" ")[0];
  const lines: Array<[TranscriptLine["speaker"], string]> = [
    ["AI", `Hi ${first}, this is Genos calling from Summit Realty. Is now a good time?`],
    ["Lead", pick(rng, ["Sure, I have a few minutes.", "Yeah, go ahead.", "Okay, quickly."])],
    ["AI", "Great — I saw you were exploring properties recently. What's most important to you right now?"],
    ["Lead", pick(rng, [
      "Mainly the budget and a good school district.",
      "I need something move-in ready within two months.",
      "Honestly just browsing for now, not in a rush.",
    ])],
    ["AI", "Understood. And do you have financing in place, or would a pre-approval help?"],
    ["Lead", pick(rng, ["I'm pre-approved already.", "I'd need help with financing.", "Paying cash, actually."])],
    ["AI", "Perfect. I can line up three listings that fit. Would Thursday at 2pm work for a viewing?"],
    ["Lead", pick(rng, ["Thursday works.", "Let me check and confirm.", "Maybe — send details first."])],
    ["AI", "Done — I'll send confirmation by email. Thanks for your time!"],
  ];
  let t = start;
  return lines.map(([speaker, text]) => {
    t += int(rng, 6, 22) * 1000;
    return { speaker, text, at: t };
  });
}

function buildCalls(rng: Rng, leads: Lead[]): Call[] {
  const outcomes: CallOutcome[] = [
    "Qualified", "Follow-Up Needed", "Appointment Booked", "Unqualified", "No Answer",
  ];
  const sentiments: Sentiment[] = ["Positive", "Neutral", "Negative"];
  const intents = [
    "High purchase intent", "Comparing options", "Price sensitive",
    "Needs financing guidance", "Low urgency", "Ready to book viewing",
  ];
  const N = 34;
  const calls: Call[] = [];
  for (let i = 0; i < N; i++) {
    const lead = pick(rng, leads);
    const outcome = pick(rng, outcomes);
    const createdAt = BASE_TIME - int(rng, 0, 6) * DAY - int(rng, 0, 23) * HOUR;
    const noAnswer = outcome === "No Answer";
    calls.push({
      id: `call-${i + 1}`,
      leadId: lead.id,
      leadName: lead.name,
      agentId: lead.assignedAgentId,
      durationSec: noAnswer ? int(rng, 5, 25) : int(rng, 95, 540),
      outcome,
      leadScore: lead.score.overall,
      sentiment: noAnswer ? "Neutral" : pick(rng, sentiments),
      intent: pick(rng, intents),
      recommendedAction: pick(rng, [
        "Book a property viewing this week",
        "Send curated listings + market report",
        "Loop in financing partner",
        "Schedule a follow-up in 3 days",
        "Mark unqualified — budget mismatch",
      ]),
      transcript: noAnswer ? [] : transcriptFor(rng, lead.name, createdAt),
      status: "Completed",
      createdAt,
    });
  }
  return calls.sort((a, b) => b.createdAt - a.createdAt);
}

function buildAppointments(rng: Rng, leads: Lead[]): Appointment[] {
  const types: Appointment["type"][] = [
    "Discovery Call", "Property Viewing", "Closing Meeting", "Follow-Up", "Consultation",
  ];
  const N = 28;
  const appts: Appointment[] = [];
  for (let i = 0; i < N; i++) {
    const lead = pick(rng, leads);
    // Spread across -5 .. +9 days from base.
    const dayOffset = int(rng, -5, 9);
    const hour = int(rng, 9, 17);
    const start = BASE_TIME + dayOffset * DAY - (BASE_TIME % DAY) + hour * HOUR;
    const past = start < BASE_TIME;
    const status: AppointmentStatus = past
      ? pick(rng, ["Completed", "Completed", "Cancelled", "Rescheduled"])
      : pick(rng, ["Confirmed", "Confirmed", "Pending"]);
    appts.push({
      id: `appt-${i + 1}`,
      leadId: lead.id,
      clientName: lead.name,
      agentId: lead.assignedAgentId,
      start,
      durationMin: pick(rng, [30, 45, 60]),
      type: pick(rng, types),
      status,
      summary:
        status === "Completed"
          ? {
              notes: pick(rng, [
                "Client responded well; ready to move forward.",
                "Discussed budget and financing; needs follow-up.",
                "Toured property — liked layout, concerned on price.",
              ]),
              outcome: pick(rng, ["Advanced to negotiation", "Follow-up scheduled", "Closed deal"]),
              nextSteps: pick(rng, ["Send contract draft", "Share 2 more listings", "Connect with lender"]),
            }
          : undefined,
    });
  }
  return appts.sort((a, b) => a.start - b.start);
}

function buildTickets(rng: Rng): Ticket[] {
  const cats: SupportCategory[] = [
    "Financing Questions", "Property Questions", "Scheduling Requests",
    "Technical Support", "General Inquiries",
  ];
  const statuses: TicketStatus[] = ["Open", "AI Handling", "Escalated", "Resolved"];
  const subjects: Record<SupportCategory, string[]> = {
    "Financing Questions": ["Current mortgage rates?", "Pre-approval timeline", "Down payment options"],
    "Property Questions": ["Is the listing still available?", "HOA fees on 24 Oak St", "Square footage details"],
    "Scheduling Requests": ["Reschedule Thursday viewing", "Weekend availability?", "Cancel my appointment"],
    "Technical Support": ["Can't access my portal", "Reset password", "Email link not working"],
    "General Inquiries": ["Do you cover Denver?", "How does your service work?", "Speak to an agent"],
  };
  const N = 20;
  const tickets: Ticket[] = [];
  for (let i = 0; i < N; i++) {
    const cat = pick(rng, cats);
    const status = pick(rng, statuses);
    const createdAt = BASE_TIME - int(rng, 0, 4) * DAY - int(rng, 0, 23) * HOUR;
    const subject = pick(rng, subjects[cat]);
    const customer = name(rng);
    const msgs = [
      { sender: "Customer" as const, text: subject, at: createdAt },
      {
        sender: "AI" as const,
        text: pick(rng, [
          "Thanks for reaching out! Let me pull that up for you.",
          "Happy to help — here's what I found.",
          "Great question. Based on your profile, here are the options.",
        ]),
        at: createdAt + int(rng, 4, 40) * 1000,
      },
    ];
    if (status === "Escalated")
      msgs.push({
        sender: "Human" as const,
        text: "Hi, this is the support team — I'll take it from here.",
        at: createdAt + int(rng, 2, 30) * MIN,
      } as never);
    if (status === "Resolved")
      msgs.push({
        sender: "Customer" as const,
        text: pick(rng, ["Perfect, thank you!", "That answers it, appreciate it.", "Great, all set."]),
        at: createdAt + int(rng, 5, 50) * MIN,
      } as never);
    tickets.push({
      id: `ticket-${i + 1}`,
      customerName: customer,
      category: cat,
      status,
      subject,
      messages: msgs,
      satisfaction: status === "Resolved" ? int(rng, 3, 5) : undefined,
      responseTimeSec: int(rng, 4, 90),
      createdAt,
      updatedAt: msgs[msgs.length - 1].at,
    });
  }
  return tickets.sort((a, b) => b.updatedAt - a.updatedAt);
}

function buildProperties(rng: Rng, leads: Lead[]): Property[] {
  const streets = ["Oak", "Maple", "Sunset", "Birchwood", "Harbor", "Aspen", "Lincoln", "Magnolia", "Riverside", "Crestview", "Park", "Elm"];
  const types = ["Residence", "Villa", "Townhome", "Loft", "Estate", "Bungalow"];
  const featurePool = ["Pool", "Garage", "Smart Home", "Hardwood Floors", "Renovated Kitchen", "Garden", "City View", "Solar Panels", "Home Office", "Walk-in Closet"];
  const statuses: PropertyStatus[] = ["Available", "Reserved", "Under Contract", "Sold"];
  const N = 12;
  const props: Property[] = [];
  for (let i = 0; i < N; i++) {
    const beds = int(rng, 2, 5);
    props.push({
      id: `prop-${i + 1}`,
      name: `${pick(rng, streets)} ${pick(rng, types)}`,
      address: `${int(rng, 12, 980)} ${pick(rng, streets)} St, ${pick(rng, CITIES)}`,
      price: int(rng, 320, 1850) * 1000,
      bedrooms: beds,
      bathrooms: int(rng, 1, beds),
      sqft: int(rng, 1100, 4200),
      status: pick(rng, statuses),
      features: sample(rng, featurePool, int(rng, 3, 5)),
      gradient: pick(rng, GRADIENTS),
      interestedLeadIds: sample(rng, leads, int(rng, 0, 4)).map((l) => l.id),
      viewingsScheduled: int(rng, 0, 7),
    });
  }
  return props;
}

function buildActivity(rng: Rng, leads: Lead[], agents: Agent[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  for (let i = 0; i < 14; i++) {
    const lead = pick(rng, leads);
    const agent = pick(rng, agents);
    const type = pick(rng, [
      "Lead Created", "Lead Qualified", "Appointment Scheduled",
      "AI Call Completed", "Customer Inquiry Resolved", "Deal Closed",
    ] as ActivityEvent["type"][]);
    const map: Record<ActivityEvent["type"], [string, string]> = {
      "Lead Created": [`New lead: ${lead.name}`, `via ${lead.source}`],
      "Lead Qualified": [`${lead.name} qualified`, `Score ${lead.score.overall} • ${agent.name}`],
      "Appointment Scheduled": [`Meeting booked with ${lead.name}`, `Assigned to ${agent.name}`],
      "AI Call Completed": [`AI call with ${lead.name}`, `Outcome logged • ${agent.name}`],
      "Customer Inquiry Resolved": [`Inquiry resolved`, `${lead.name} • by AI`],
      "Deal Closed": [`Deal closed — ${lead.name}`, `+${(lead.estimatedValue / 1000).toFixed(0)}k • ${agent.name}`],
    };
    const [title, detail] = map[type];
    events.push({
      id: `act-${i + 1}`,
      type,
      title,
      detail,
      agentId: agent.id,
      at: BASE_TIME - int(rng, 1, 600) * MIN,
    });
  }
  return events.sort((a, b) => b.at - a.at);
}

function buildNotifications(rng: Rng): NotificationItem[] {
  const items: Array<[string, string, NotificationItem["kind"]]> = [
    ["High-value lead", "A lead worth $84k just entered the pipeline.", "success"],
    ["At-risk opportunity", "3 leads have had no follow-up in 5 days.", "warning"],
    ["Goal reached", "Team hit 92% of the monthly meeting target.", "info"],
    ["AI call completed", "Qualified call with a hot Zillow lead.", "success"],
  ];
  return items.map(([title, detail, kind], i) => ({
    id: `notif-${i + 1}`,
    title,
    detail,
    kind,
    at: BASE_TIME - int(rng, 5, 240) * MIN,
    read: i > 1,
  }));
}

function buildIntegrations(): Integration[] {
  return [
    { id: "hubspot", name: "HubSpot", description: "Sync contacts and deals", connected: true, category: "CRM" },
    { id: "salesforce", name: "Salesforce", description: "Enterprise CRM sync", connected: false, category: "CRM" },
    { id: "gcal", name: "Google Calendar", description: "Two-way appointment sync", connected: true, category: "Calendar" },
    { id: "gmail", name: "Gmail", description: "Send and track emails", connected: true, category: "Communication" },
    { id: "slack", name: "Slack", description: "Real-time team alerts", connected: false, category: "Communication" },
    { id: "twilio", name: "Twilio", description: "Voice + SMS for AI calling", connected: true, category: "Communication" },
    { id: "openai", name: "OpenAI", description: "Powers AI agents", connected: true, category: "AI" },
  ];
}

function buildSeries(rng: Rng) {
  const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const revenue: SeriesPoint[] = months.map((m, i) => ({
    label: m,
    closed: int(rng, 180, 320) + i * 14,
    forecast: int(rng, 200, 360) + i * 16,
  }));

  const leadVolume: SeriesPoint[] = months.map((m, i) => ({
    label: m,
    leads: int(rng, 120, 220) + i * 6,
    qualified: int(rng, 50, 110) + i * 4,
  }));

  const conversion: SeriesPoint[] = months.map((m) => ({
    label: m,
    rate: float(rng, 14, 32, 1),
  }));

  const leadSources: SeriesPoint[] = SOURCES.map((s) => ({
    label: s,
    value: int(rng, 40, 220),
  }));

  const callsWeek: SeriesPoint[] = days.map((d) => ({
    label: d,
    calls: int(rng, 18, 64),
    booked: int(rng, 4, 22),
  }));

  const appointments: SeriesPoint[] = months.map((m) => ({
    label: m,
    booked: int(rng, 30, 72),
    attended: int(rng, 20, 60),
    noShow: int(rng, 3, 14),
  }));

  const support: SeriesPoint[] = days.map((d) => ({
    label: d,
    resolved: int(rng, 20, 70),
    escalated: int(rng, 2, 12),
  }));

  return { revenue, leadVolume, conversion, leadSources, callsWeek, appointments, support };
}

export interface SeedData {
  agents: Agent[];
  leads: Lead[];
  calls: Call[];
  appointments: Appointment[];
  tickets: Ticket[];
  properties: Property[];
  activity: ActivityEvent[];
  notifications: NotificationItem[];
  integrations: Integration[];
  series: ReturnType<typeof buildSeries>;
}

export function createSeed(): SeedData {
  const rng = makeRng(424242);
  const agents = buildAgents();
  const leads = buildLeads(rng, agents);
  return {
    agents,
    leads,
    calls: buildCalls(rng, leads),
    appointments: buildAppointments(rng, leads),
    tickets: buildTickets(rng),
    properties: buildProperties(rng, leads),
    activity: buildActivity(rng, leads, agents),
    notifications: buildNotifications(rng),
    integrations: buildIntegrations(),
    series: buildSeries(rng),
  };
}

// Helpers reused by the realtime engine.
export const mockHelpers = {
  name,
  phone,
  emailFor,
  pickCity: (rng: Rng) => pick(rng, CITIES),
  pickSource: (rng: Rng) => pick(rng, SOURCES),
  gradients: GRADIENTS,
  scoreFor,
  aiSummary,
};
