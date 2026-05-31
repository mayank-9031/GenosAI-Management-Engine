"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  ActivityEvent,
  Lead,
  LeadSource,
  NotificationItem,
  Property,
  PropertyStatus,
} from "@/lib/types";
import { BASE_TIME, createSeed, mockHelpers, type SeedData } from "@/lib/mock/data";
import { makeRng, pick, int, float, type Rng } from "@/lib/mock/random";

export interface AiConfig {
  qualificationQuestions: string[];
  minScoreToQualify: number;
  autoBookAppointments: boolean;
  workingHours: string;
  autoEscalateAfterMin: number;
  supportTone: "Professional" | "Friendly" | "Concise";
}

export interface NewLeadInput {
  name: string;
  email: string;
  phone: string;
  location: string;
  source: LeadSource;
  budget: number;
  timeline: string;
  purchaseIntent: "High" | "Medium" | "Low";
}

export interface NewPropertyInput {
  name: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: PropertyStatus;
  features: string[];
}

interface AppState extends SeedData {
  now: number;
  clockHydrated: boolean;
  counter: number;
  aiConfig: AiConfig;

  // clock / realtime
  hydrateClock: () => void;
  tickClock: () => void;
  simulateStep: () => void;

  // entity creation
  addLead: (input: NewLeadInput) => void;
  addProperty: (input: NewPropertyInput) => void;

  // user actions
  toggleIntegration: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateAiConfig: (patch: Partial<AiConfig>) => void;
  resetData: () => void;
}

const DEFAULT_AI_CONFIG: AiConfig = {
  qualificationQuestions: [
    "What is your target budget range?",
    "What is your ideal timeline to purchase?",
    "Do you currently have financing in place?",
    "What features matter most to you?",
  ],
  minScoreToQualify: 60,
  autoBookAppointments: true,
  workingHours: "9:00 AM – 6:00 PM",
  autoEscalateAfterMin: 15,
  supportTone: "Friendly",
};

// A non-deterministic rng for live simulation (client-only, post-mount).
let liveRng: Rng = makeRng(7);

function spawnLead(state: AppState, at: number): Lead {
  const n = mockHelpers.name(liveRng);
  const budget = int(liveRng, 250, 1400) * 1000;
  const intent = pick(liveRng, ["High", "Medium", "Low"] as const);
  return {
    id: `lead-live-${state.counter + 1}`,
    name: n,
    email: mockHelpers.emailFor(n),
    phone: mockHelpers.phone(liveRng),
    location: mockHelpers.pickCity(liveRng),
    source: mockHelpers.pickSource(liveRng),
    status: "New",
    score: mockHelpers.scoreFor(liveRng, "New"),
    assignedAgentId: pick(liveRng, state.agents).id,
    estimatedValue: Math.round(budget * float(liveRng, 0.04, 0.07, 3)),
    budget,
    timeline: "Exploring",
    purchaseIntent: intent,
    financingNeeds: pick(liveRng, ["Pre-approved", "Needs financing", "Cash buyer"]),
    aiSummary: mockHelpers.aiSummary(liveRng, n, intent),
    createdAt: at,
    lastActivityAt: at,
  };
}

const NEXT_STATUS: Record<string, Lead["status"] | null> = {
  New: "Contacted",
  Contacted: "Qualified",
  Qualified: "Appointment Scheduled",
  "Appointment Scheduled": "Negotiation",
  Negotiation: "Won",
  Won: null,
  Lost: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...createSeed(),
      now: BASE_TIME,
      clockHydrated: false,
      counter: 0,
      aiConfig: DEFAULT_AI_CONFIG,

      hydrateClock: () => {
        const state = get();
        if (state.clockHydrated) {
          set({ now: Date.now() });
          return;
        }
        // First load: shift the fixed-anchor seed onto the real clock.
        const realNow = Date.now();
        const delta = realNow - BASE_TIME;
        liveRng = makeRng((realNow % 100000) + 13);
        const shift = <T,>(o: T, keys: (keyof T)[]): T => {
          const c = { ...o };
          for (const k of keys) {
            const v = c[k];
            if (typeof v === "number") c[k] = (v + delta) as T[keyof T];
          }
          return c;
        };
        set({
          now: realNow,
          clockHydrated: true,
          leads: state.leads.map((l) => shift(l, ["createdAt", "lastActivityAt"])),
          calls: state.calls.map((c) => ({
            ...shift(c, ["createdAt"]),
            transcript: c.transcript.map((t) => ({ ...t, at: t.at + delta })),
          })),
          appointments: state.appointments.map((a) => shift(a, ["start"])),
          tickets: state.tickets.map((t) => ({
            ...shift(t, ["createdAt", "updatedAt"]),
            messages: t.messages.map((m) => ({ ...m, at: m.at + delta })),
          })),
          activity: state.activity.map((a) => shift(a, ["at"])),
          notifications: state.notifications.map((nn) => shift(nn, ["at"])),
        });
      },

      tickClock: () => set({ now: Date.now() }),

      simulateStep: () => {
        const state = get();
        const at = Date.now();
        const roll = liveRng();
        const updates: Partial<AppState> = {};
        const newActivity: ActivityEvent[] = [];
        let counter = state.counter;

        // ~35% chance: a brand-new lead arrives.
        if (roll < 0.35) {
          counter += 1;
          const lead = spawnLead({ ...state, counter }, at);
          updates.leads = [lead, ...state.leads].slice(0, 200);
          newActivity.push({
            id: `act-live-${counter}`,
            type: "Lead Created",
            title: `New lead: ${lead.name}`,
            detail: `via ${lead.source}`,
            agentId: lead.assignedAgentId,
            at,
          });
        } else {
          // Otherwise: advance a random in-flight lead's status.
          const candidates = (updates.leads ?? state.leads).filter(
            (l) => NEXT_STATUS[l.status],
          );
          if (candidates.length) {
            const target = pick(liveRng, candidates);
            const next = NEXT_STATUS[target.status]!;
            counter += 1;
            const leads = (updates.leads ?? state.leads).map((l) =>
              l.id === target.id
                ? { ...l, status: next, lastActivityAt: at, score: { ...l.score, overall: Math.min(99, l.score.overall + 2) } }
                : l,
            );
            updates.leads = leads;
            const map: Partial<Record<Lead["status"], ActivityEvent["type"]>> = {
              Qualified: "Lead Qualified",
              "Appointment Scheduled": "Appointment Scheduled",
              Won: "Deal Closed",
            };
            const type = map[next] ?? "AI Call Completed";
            newActivity.push({
              id: `act-live-${counter}`,
              type,
              title:
                type === "Deal Closed"
                  ? `Deal closed — ${target.name}`
                  : type === "Lead Qualified"
                  ? `${target.name} qualified`
                  : type === "Appointment Scheduled"
                  ? `Meeting booked with ${target.name}`
                  : `${target.name} → ${next}`,
              detail: `Score ${Math.min(99, target.score.overall + 2)} • auto-advanced`,
              agentId: target.assignedAgentId,
              at,
            });
          }
        }

        if (newActivity.length) {
          updates.activity = [...newActivity, ...state.activity].slice(0, 60);
        }
        updates.counter = counter;
        updates.now = at;
        set(updates);
      },

      addLead: (input) => {
        const state = get();
        const at = Date.now();
        const counter = state.counter + 1;
        const lead: Lead = {
          id: `lead-new-${counter}`,
          name: input.name,
          email: input.email,
          phone: input.phone,
          location: input.location,
          source: input.source,
          status: "New",
          score: mockHelpers.scoreFor(liveRng, "New"),
          assignedAgentId: pick(liveRng, state.agents).id,
          estimatedValue: Math.round(input.budget * float(liveRng, 0.04, 0.07, 3)),
          budget: input.budget,
          timeline: input.timeline,
          purchaseIntent: input.purchaseIntent,
          financingNeeds: pick(liveRng, ["Pre-approved", "Needs financing", "Cash buyer", "Exploring options"]),
          aiSummary: mockHelpers.aiSummary(liveRng, input.name, input.purchaseIntent),
          createdAt: at,
          lastActivityAt: at,
        };
        set({
          counter,
          leads: [lead, ...state.leads],
          activity: [
            {
              id: `act-new-lead-${counter}`,
              type: "Lead Created",
              title: `New lead: ${lead.name}`,
              detail: `via ${lead.source} · added manually`,
              agentId: lead.assignedAgentId,
              at,
            } as ActivityEvent,
            ...state.activity,
          ].slice(0, 60),
          notifications: [
            { id: `notif-lead-${counter}`, title: "Lead added", detail: `${lead.name} entered the pipeline.`, kind: "success", at, read: false } as NotificationItem,
            ...state.notifications,
          ],
        });
      },

      addProperty: (input) => {
        const state = get();
        const counter = state.counter + 1;
        const property: Property = {
          id: `prop-new-${counter}`,
          name: input.name,
          address: input.address,
          price: input.price,
          bedrooms: input.bedrooms,
          bathrooms: input.bathrooms,
          sqft: input.sqft,
          status: input.status,
          features: input.features,
          gradient: pick(liveRng, mockHelpers.gradients),
          interestedLeadIds: [],
          viewingsScheduled: 0,
        };
        set({
          counter,
          properties: [property, ...state.properties],
          notifications: [
            { id: `notif-prop-${counter}`, title: "Property listed", detail: `${property.name} added to inventory.`, kind: "info", at: Date.now(), read: false } as NotificationItem,
            ...state.notifications,
          ],
        });
      },

      toggleIntegration: (id) =>
        set((s) => ({
          integrations: s.integrations.map((i) =>
            i.id === id ? { ...i, connected: !i.connected } : i,
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      updateAiConfig: (patch) =>
        set((s) => ({ aiConfig: { ...s.aiConfig, ...patch } })),

      resetData: () => {
        set({ ...createSeed(), now: Date.now(), clockHydrated: false, counter: 0, aiConfig: DEFAULT_AI_CONFIG });
      },
    }),
    {
      name: "genosai-store-v2",
      storage: createJSONStorage(() => localStorage),
      // SSR-safe: server + first client render use the deterministic seed; the
      // provider rehydrates persisted state after mount (no hydration mismatch).
      skipHydration: true,
      partialize: (s) => ({
        agents: s.agents,
        leads: s.leads,
        calls: s.calls,
        appointments: s.appointments,
        tickets: s.tickets,
        properties: s.properties,
        activity: s.activity,
        notifications: s.notifications,
        integrations: s.integrations,
        series: s.series,
        aiConfig: s.aiConfig,
        counter: s.counter,
        clockHydrated: s.clockHydrated,
      }),
    },
  ),
);

export type { NotificationItem };
