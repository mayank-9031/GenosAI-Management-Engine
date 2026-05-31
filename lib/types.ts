// ── Shared ────────────────────────────────────────────────────────────────
export type ID = string;

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Appointment Scheduled"
  | "Negotiation"
  | "Won"
  | "Lost";

export type LeadSource =
  | "Facebook Ads"
  | "Google Ads"
  | "Website"
  | "Referral"
  | "Cold Outreach"
  | "Zillow"
  | "Webinar";

export interface QualificationScore {
  budget: number; // 0-100
  urgency: number;
  engagement: number;
  intent: number;
  overall: number;
}

export interface Lead {
  id: ID;
  name: string;
  email: string;
  phone: string;
  location: string;
  source: LeadSource;
  status: LeadStatus;
  score: QualificationScore;
  assignedAgentId: ID;
  estimatedValue: number;
  budget: number;
  timeline: string;
  purchaseIntent: "High" | "Medium" | "Low";
  financingNeeds: string;
  aiSummary: {
    goals: string;
    painPoints: string;
    buyingIntent: string;
    nextActions: string[];
  };
  createdAt: number;
  lastActivityAt: number;
}

// ── Calls ─────────────────────────────────────────────────────────────────
export type CallOutcome =
  | "Qualified"
  | "Follow-Up Needed"
  | "Appointment Booked"
  | "Unqualified"
  | "No Answer";

export type Sentiment = "Positive" | "Neutral" | "Negative";

export interface TranscriptLine {
  speaker: "AI" | "Lead";
  text: string;
  at: number;
}

export interface Call {
  id: ID;
  leadId: ID;
  leadName: string;
  agentId: ID;
  durationSec: number;
  outcome: CallOutcome;
  leadScore: number;
  sentiment: Sentiment;
  intent: string;
  recommendedAction: string;
  transcript: TranscriptLine[];
  status: "In Progress" | "Completed";
  createdAt: number;
}

// ── Appointments ────────────────────────────────────────────────────────────
export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Completed"
  | "Cancelled"
  | "Rescheduled";

export type MeetingType =
  | "Discovery Call"
  | "Property Viewing"
  | "Closing Meeting"
  | "Follow-Up"
  | "Consultation";

export interface Appointment {
  id: ID;
  leadId: ID;
  clientName: string;
  agentId: ID;
  start: number;
  durationMin: number;
  type: MeetingType;
  status: AppointmentStatus;
  summary?: {
    notes: string;
    outcome: string;
    nextSteps: string;
  };
}

// ── Support ───────────────────────────────────────────────────────────────
export type SupportCategory =
  | "Financing Questions"
  | "Property Questions"
  | "Scheduling Requests"
  | "Technical Support"
  | "General Inquiries";

export type TicketStatus = "Open" | "AI Handling" | "Escalated" | "Resolved";

export interface SupportMessage {
  sender: "Customer" | "AI" | "Human";
  text: string;
  at: number;
}

export interface Ticket {
  id: ID;
  customerName: string;
  category: SupportCategory;
  status: TicketStatus;
  subject: string;
  messages: SupportMessage[];
  satisfaction?: number; // 1-5
  responseTimeSec: number;
  createdAt: number;
  updatedAt: number;
}

// ── Properties ──────────────────────────────────────────────────────────────
export type PropertyStatus = "Available" | "Reserved" | "Under Contract" | "Sold";

export interface Property {
  id: ID;
  name: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: PropertyStatus;
  features: string[];
  gradient: string; // visual placeholder for photo
  interestedLeadIds: ID[];
  viewingsScheduled: number;
}

// ── Agents / Team ────────────────────────────────────────────────────────────
export interface Agent {
  id: ID;
  name: string;
  role: string;
  avatarGradient: string;
  leadsAssigned: number;
  callsCompleted: number;
  meetingsBooked: number;
  dealsClosed: number;
  revenueGenerated: number;
  conversionRate: number; // %
}

// ── Activity feed ────────────────────────────────────────────────────────────
export type ActivityType =
  | "Lead Created"
  | "Lead Qualified"
  | "Appointment Scheduled"
  | "AI Call Completed"
  | "Customer Inquiry Resolved"
  | "Deal Closed";

export interface ActivityEvent {
  id: ID;
  type: ActivityType;
  title: string;
  detail: string;
  agentId?: ID;
  at: number;
}

export interface NotificationItem {
  id: ID;
  title: string;
  detail: string;
  kind: "info" | "success" | "warning";
  at: number;
  read: boolean;
}

// ── Integrations ──────────────────────────────────────────────────────────────
export interface Integration {
  id: string;
  name: string;
  description: string;
  connected: boolean;
  category: "CRM" | "Calendar" | "Communication" | "AI";
}

// ── Time-series points for analytics ─────────────────────────────────────────
export interface SeriesPoint {
  label: string;
  [key: string]: number | string;
}
