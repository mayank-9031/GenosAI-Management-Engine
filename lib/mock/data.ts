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
  SupportMessage,
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

function transcriptFor(
  rng: Rng,
  leadName: string,
  start: number,
  outcome: CallOutcome,
  agentFirst: string,
): TranscriptLine[] {
  const first = leadName.split(" ")[0];
  const lines: Array<[TranscriptLine["speaker"], string]> = [];
  const push = (s: TranscriptLine["speaker"], text: string) => lines.push([s, text]);

  // ── Opening ──
  push("AI", `Hi, may I speak with ${first}? This is Genos, the AI assistant calling on behalf of Summit Realty.`);
  push("Lead", pick(rng, ["Speaking — what's this regarding?", `Yes, this is ${first}.`, "Hi, yeah, that's me."]));
  push("AI", "Thanks for picking up. I'll keep this quick — you recently browsed a few of our listings online, and I wanted to help you zero in on the right place. Do you have two minutes?");
  push("Lead", pick(rng, ["Sure, go ahead.", "Okay, I've got a couple minutes.", "Yeah, that works."]));

  // ── Motivation ──
  push("AI", "Appreciate it. To point you in the right direction — what's prompting a move right now?");
  push("Lead", pick(rng, [
    "We're outgrowing our current place — there's a baby on the way.",
    "My lease is up in a couple of months and I'd rather buy than renew.",
    "I'm relocating for a new job, so the timing matters quite a bit.",
    "Honestly, I'm mostly just keeping an eye on the market for now.",
  ]));

  // ── Must-haves ──
  push("AI", "That makes total sense. And what are the non-negotiables at the top of your list — area, size, anything specific?");
  push("Lead", pick(rng, [
    "A good school district and at least three bedrooms.",
    "Somewhere walkable, close to downtown if possible.",
    "A yard for the dog and a dedicated home office.",
    "I'm flexible on area, as long as it's genuinely move-in ready.",
  ]));
  push("AI", "Noted. A few of our newer listings hit exactly those points, so I think we can find something you'll like.");

  // ── Budget ──
  push("AI", "What budget range are you most comfortable in? That way I won't send you anything off the mark.");
  push("Lead", pick(rng, [
    "Somewhere around 450 to 550 thousand.",
    "Up to about 700, depending on the property.",
    "We'd like to stay under 400 if we can swing it.",
    "I'm not totally sure yet — that's part of what I'm trying to figure out.",
  ]));

  // ── Financing ──
  push("AI", "Helpful, thank you. Have you spoken with a lender yet, or would a quick pre-approval be useful?");
  push("Lead", pick(rng, [
    "We're already pre-approved, actually.",
    "Not yet — that's honestly one of my bigger worries.",
    "We'll be paying cash.",
    "I started the process but it kind of stalled.",
  ]));

  // ── Outcome-specific close ──
  switch (outcome) {
    case "Appointment Booked":
      push("AI", `Perfect — I've got three listings that line up almost exactly with that. I'd love to set you up with our agent ${agentFirst} for an in-person viewing. Would Thursday at 2pm or Saturday morning suit you better?`);
      push("Lead", pick(rng, ["Thursday at 2 works for me.", "Saturday morning — let's do that."]));
      push("AI", `Wonderful, you're booked in. I'll email the address, photos, and a calendar invite, and you'll get a reminder the day before. Is there anything else you'd like ${agentFirst} to prepare?`);
      push("Lead", pick(rng, ["Maybe some comparable sales in the area?", "No, that covers it — thank you!"]));
      push("AI", `Consider it done. Thanks so much for your time, ${first} — talk soon!`);
      break;
    case "Qualified":
      push("AI", "You're exactly the kind of buyer these listings were priced for. I'll put together a tailored shortlist and have our agent reach out this week to line up a viewing — does that sound good?");
      push("Lead", pick(rng, ["Yeah, send them over.", "Sounds good — I'll watch for the email."]));
      push("AI", "Brilliant. I'll get those over within the hour, along with a short market snapshot for the area. Thanks for your time!");
      push("Lead", pick(rng, ["Appreciate it.", "Great, thanks."]));
      break;
    case "Follow-Up Needed":
      push("AI", "Totally understand — it sounds like the timing isn't quite locked in yet, and that's completely fine.");
      push("Lead", pick(rng, ["Yeah, I need to talk it over with my partner first.", "Right, I'm just not ready to commit this week."]));
      push("AI", "No pressure at all. How about I check back in a week or two, once you've had a chance to think it through? I'll also send a market report so you've got real numbers to work with.");
      push("Lead", pick(rng, ["That'd be great, thanks.", "Sure, reach out then."]));
      push("AI", `Will do. Enjoy the rest of your day, ${first}!`);
      break;
    case "Unqualified":
      push("AI", "I appreciate the honesty. Based on what you've shared, it sounds like the current inventory in that range might not be the right fit just yet.");
      push("Lead", pick(rng, ["Yeah, it's probably not the right time.", "Honestly, I think we jumped the gun a little."]));
      push("AI", "That's no problem at all. I'll keep your preferences on file and only reach out if something genuinely in range comes up — no spam, I promise.");
      push("Lead", pick(rng, ["Sounds fair, thanks.", "Appreciate that."]));
      push("AI", "Take care, and best of luck with everything!");
      break;
    default:
      push("AI", "Thanks for the detail — that gives me plenty to work with. I'll follow up shortly.");
  }

  let t = start;
  return lines.map(([speaker, text]) => {
    t += int(rng, 5, 18) * 1000;
    return { speaker, text, at: t };
  });
}

function buildCalls(rng: Rng, leads: Lead[], agents: Agent[]): Call[] {
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
      transcript: noAnswer
        ? []
        : transcriptFor(
            rng,
            lead.name,
            createdAt,
            outcome,
            (agents.find((a) => a.id === lead.assignedAgentId)?.name ?? "Sarah Johnson").split(" ")[0],
          ),
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

type Turn = [SupportMessage["sender"], string];
interface TicketScript {
  subject: string;
  turns: Turn[];
}

// Believable, multi-turn support conversations per category. Each ends mid-thread
// for Open/AI Handling, with a human handoff for Escalated, and a wrap-up for Resolved.
const TICKET_SCRIPTS: Record<SupportCategory, TicketScript[]> = {
  "Financing Questions": [
    {
      subject: "What mortgage rate could I expect?",
      turns: [
        ["Customer", "Hi, I'm looking at the 3-bed on Maple St and trying to work out monthly payments. What kind of mortgage rate could I realistically expect right now?"],
        ["AI", "Happy to help! Rates depend on a few things — credit score, down payment, and loan term. For a well-qualified buyer today, 30-year fixed rates are landing roughly between 6.4% and 7.1%. Do you know your approximate credit score?"],
        ["Customer", "It's around 740, and I was planning to put down 20%."],
        ["AI", "That's a strong profile — with 740 and 20% down you'd likely be at the lower end, around 6.4–6.6%. On a $480k home that's roughly a $2,420/month principal-and-interest payment, before taxes and insurance. Would you like me to run a full estimate including those?"],
        ["Customer", "Yes please, that would be really useful."],
        ["AI", "Great. Estimating local property tax at 1.1% and insurance around $130/month, your all-in monthly would be about $2,990. I can also connect you with our lending partner for a no-obligation pre-approval so you get exact numbers — want me to set that up?"],
      ],
    },
    {
      subject: "How long does pre-approval take?",
      turns: [
        ["Customer", "How long does the pre-approval process usually take? I don't want to miss out on a listing while I wait."],
        ["AI", "Good question — with our partner lender most buyers get a pre-approval letter within 24 to 48 hours once they've submitted income docs, bank statements, and authorized a credit check. Do you have those documents handy?"],
        ["Customer", "I have pay stubs and bank statements, but not my tax returns from last year."],
        ["AI", "That's usually fine for an initial pre-approval — tax returns are typically needed later, at full underwriting. I'd recommend starting now so you're ready to make an offer. Shall I send you the secure document upload link?"],
        ["Customer", "Yes, and roughly how much can I borrow on a $95k salary?"],
        ["AI", "As a rough guide, lenders often allow a mortgage where total housing costs stay near 28% of gross monthly income. On $95k that's about $2,200/month, which could support a loan around $330k–$360k depending on your other debts. The pre-approval will confirm the exact figure."],
      ],
    },
  ],
  "Property Questions": [
    {
      subject: "Is the Sunset Residence still available?",
      turns: [
        ["Customer", "Hi! Is the Sunset Residence listing still available? I saw it last week but the status wasn't clear."],
        ["AI", "Let me check that for you… The Sunset Residence is currently marked Available — there's one offer pending review but it has not been accepted, so you can absolutely still view it or submit an offer. Would you like the latest details?"],
        ["Customer", "Yes. What are the HOA fees and is the price negotiable?"],
        ["AI", "HOA fees are $245/month, which covers landscaping, the community pool, and exterior maintenance. The list price is $1,054,000 — the sellers have indicated some flexibility, and comparable homes nearby closed about 2–3% under asking recently. Are you thinking of putting in an offer soon?"],
        ["Customer", "Possibly. Does it have any major repairs needed?"],
        ["AI", "The seller's disclosure notes a roof replacement in 2021 and a newer HVAC system, so no major near-term repairs are flagged. I'd still recommend a professional inspection. I can have an agent send you the full disclosure packet and book a viewing — interested?"],
      ],
    },
    {
      subject: "Square footage and lot size on Oak Residence",
      turns: [
        ["Customer", "Can you confirm the exact square footage and lot size for the Oak Residence? The listing and the county records seem to differ."],
        ["AI", "Good catch — that's a common discrepancy. Our listing shows 2,180 sq ft of finished living space. County records sometimes exclude the finished basement, which here adds about 380 sq ft. The lot is 0.28 acres. Would you like the floor plan so you can see the breakdown room by room?"],
        ["Customer", "Yes please. Also, is the basement permitted?"],
        ["AI", "I'll send the floor plan now. Regarding the basement — the seller's disclosure indicates the finish was permitted in 2019, and I can include the permit reference in the packet so your inspector can verify. Anything else about the property I can dig into?"],
        ["Customer", "That's really thorough, thank you!"],
      ],
    },
  ],
  "Scheduling Requests": [
    {
      subject: "Need to reschedule Thursday's viewing",
      turns: [
        ["Customer", "Something came up at work — I need to reschedule my Thursday 2pm viewing for the Park Townhome. Can we move it?"],
        ["AI", "No problem at all! I have a few openings: Friday at 4:30pm, Saturday at 10am, or Saturday at 1pm. Which works best for you?"],
        ["Customer", "Saturday at 10am would be perfect."],
        ["AI", "Done — I've moved your viewing to Saturday at 10:00am with agent Priya Patel. You'll get an updated calendar invite and a reminder the evening before. Would you like the same address details resent?"],
        ["Customer", "Yes please, and can my partner join?"],
        ["AI", "Absolutely, partners are always welcome — I've noted two attendees. I've resent the address and parking instructions to your email. See you Saturday!"],
      ],
    },
    {
      subject: "Do you have weekend availability?",
      turns: [
        ["Customer", "I work weekdays — do your agents do weekend viewings at all?"],
        ["AI", "We do! Most of our agents offer Saturday viewings between 9am and 4pm, and some have Sunday afternoon slots. Which property or area were you hoping to see?"],
        ["Customer", "The Birchwood Bungalow, and ideally this Saturday."],
        ["AI", "Birchwood Bungalow has Saturday slots at 11am and 2:30pm this week. Shall I reserve one for you? I'll just need a name and the best contact number."],
        ["Customer", "11am, and it's under Marcus, 555-0192."],
        ["AI", "All set, Marcus — you're booked for Saturday at 11am. A confirmation and the address are on the way to your phone and email now."],
      ],
    },
  ],
  "Technical Support": [
    {
      subject: "Can't log into my buyer portal",
      turns: [
        ["Customer", "I'm trying to log into my buyer portal to see my saved listings but it keeps saying 'invalid credentials'. I'm sure the password is right."],
        ["AI", "Sorry for the hassle! A couple of quick things to try: first, is the email you're using the same one you signed up with? And second, the password field is case-sensitive — could caps lock be on?"],
        ["Customer", "Same email, and caps lock is off. Still no luck."],
        ["AI", "Thanks for checking. It's possible your session token expired after a recent update. I can send a secure password-reset link to your email — it's valid for 30 minutes. Want me to send it now?"],
        ["Customer", "Yes please. It's a bit frustrating, I've tried three times."],
        ["AI", "Completely understand, and I'm sorry for the friction. The reset link is on its way. If it still fails after resetting, I'll escalate this to our technical team straight away so a human can dig into your account directly."],
      ],
    },
    {
      subject: "Listing photos won't load",
      turns: [
        ["Customer", "None of the property photos are loading for me — I just see grey boxes on every listing."],
        ["AI", "That's odd, sorry about that. It's usually one of two things: a browser cache issue or an ad-blocker blocking our image host. Could you try a hard refresh (Ctrl+Shift+R) and let me know if that helps?"],
        ["Customer", "Tried it, still grey boxes. I'm on Chrome on my work laptop."],
        ["AI", "Thanks for testing. Work networks sometimes block our image CDN. Could you try opening one listing on your phone using mobile data, just to confirm? If it works there, it's almost certainly a network restriction on the office Wi-Fi."],
        ["Customer", "Yeah — it loads fine on my phone."],
        ["AI", "That confirms it's your office network filtering our image host. I'd suggest asking IT to allow 'cdn.summitrealty.app', or simply browse on mobile for now. I'll also flag this to our team so we can document the workaround."],
      ],
    },
  ],
  "General Inquiries": [
    {
      subject: "How does your AI service actually work?",
      turns: [
        ["Customer", "I keep getting messages from an 'AI assistant'. How does this whole thing actually work — am I talking to a real person or not?"],
        ["AI", "Great question, and totally fair to ask! I'm Genos, an AI assistant for Summit Realty. I handle quick questions, scheduling, and matching you with listings 24/7. For anything that needs a human touch — negotiations, contracts, in-person viewings — I hand you straight to a licensed agent. Is there something specific I can help with today?"],
        ["Customer", "I just want to understand if my information is safe."],
        ["AI", "Absolutely — your details are encrypted and only shared with the agent assigned to you. We never sell your data, and you can request deletion at any time. Would you like me to connect you with a human agent as well, just so you have a direct contact?"],
        ["Customer", "Yes, that would make me more comfortable."],
        ["AI", "Of course — let me bring in one of our agents to introduce themselves."],
      ],
    },
    {
      subject: "Do you cover the Denver area?",
      turns: [
        ["Customer", "Do you cover Denver and the surrounding suburbs? Most of what I've seen is further south."],
        ["AI", "We do! We cover Denver proper plus Aurora, Lakewood, Littleton, and Highlands Ranch. What kind of property and budget are you considering for the area?"],
        ["Customer", "A townhome around 400k, ideally close to light rail."],
        ["AI", "Perfect — there are several townhomes in that range near the light rail in Littleton and Aurora right now. I can put together a shortlist and have a local agent reach out. What's the best email to send those to?"],
        ["Customer", "That sounds great, thank you so much for the quick help!"],
      ],
    },
  ],
};

function buildTickets(rng: Rng): Ticket[] {
  const cats: SupportCategory[] = [
    "Financing Questions", "Property Questions", "Scheduling Requests",
    "Technical Support", "General Inquiries",
  ];
  const statuses: TicketStatus[] = ["Open", "AI Handling", "Escalated", "Resolved"];
  const N = 20;
  const tickets: Ticket[] = [];
  for (let i = 0; i < N; i++) {
    const cat = pick(rng, cats);
    const status = pick(rng, statuses);
    const createdAt = BASE_TIME - int(rng, 0, 4) * DAY - int(rng, 0, 23) * HOUR;
    const script = pick(rng, TICKET_SCRIPTS[cat]);
    const customer = name(rng);

    // Build the base thread with realistic intervals.
    let t = createdAt;
    const msgs: SupportMessage[] = script.turns.map(([sender, text], idx) => {
      // AI replies in seconds; customers take longer to come back.
      t += idx === 0 ? 0 : sender === "AI" ? int(rng, 8, 55) * 1000 : int(rng, 1, 9) * MIN;
      return { sender, text, at: t };
    });

    if (status === "Escalated") {
      t += int(rng, 3, 18) * MIN;
      msgs.push({
        sender: "Human",
        text: pick(rng, [
          "Hi, this is Jordan from the Summit support team — I'll take it from here and make sure this gets sorted properly.",
          "Hello, this is Mia, a senior specialist. Thanks for your patience — let me personally look into this for you.",
        ]),
        at: t,
      });
    }

    if (status === "Resolved") {
      t += int(rng, 2, 12) * MIN;
      msgs.push({
        sender: "Customer",
        text: pick(rng, [
          "That's exactly what I needed — thank you so much!",
          "Perfect, really appreciate how quick and clear that was.",
          "Great, that fully answers it. Thanks for the help!",
        ]),
        at: t,
      });
      msgs.push({
        sender: "AI",
        text: "You're very welcome! I'll leave your file open in case anything else comes up. Have a great day. 🏡",
        at: t + int(rng, 10, 40) * 1000,
      });
    }

    tickets.push({
      id: `ticket-${i + 1}`,
      customerName: customer,
      category: cat,
      status,
      subject: script.subject,
      messages: msgs,
      satisfaction: status === "Resolved" ? int(rng, 4, 5) : undefined,
      responseTimeSec: int(rng, 6, 75),
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
    calls: buildCalls(rng, leads, agents),
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
