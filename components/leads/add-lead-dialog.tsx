"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useStore, type NewLeadInput } from "@/lib/store/store";
import type { LeadSource } from "@/lib/types";

const SOURCES: LeadSource[] = [
  "Facebook Ads", "Google Ads", "Website", "Referral", "Cold Outreach", "Zillow", "Webinar",
];
const TIMELINES = ["Immediately", "1–3 months", "3–6 months", "6–12 months", "Exploring"];

const EMPTY: NewLeadInput = {
  name: "",
  email: "",
  phone: "",
  location: "",
  source: "Website",
  budget: 500000,
  timeline: "1–3 months",
  purchaseIntent: "Medium",
};

export function AddLeadDialog() {
  const addLead = useStore((s) => s.addLead);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<NewLeadInput>(EMPTY);

  const set = <K extends keyof NewLeadInput>(k: K, v: NewLeadInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim() && /\S+@\S+\.\S+/.test(form.email);

  const submit = () => {
    if (!valid) return;
    addLead(form);
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus /> Add Lead</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>Capture a prospect — AI will score and summarise them automatically.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Full Name *" className="col-span-2">
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jordan Rivera" />
          </Field>
          <Field label="Email *">
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jordan@email.com" />
          </Field>
          <Field label="Phone">
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+1 (555) 012-3456" />
          </Field>
          <Field label="Location">
            <Input value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Austin, TX" />
          </Field>
          <Field label="Lead Source">
            <Select
              value={form.source}
              onChange={(e) => set("source", e.target.value as LeadSource)}
              options={SOURCES.map((s) => ({ label: s, value: s }))}
            />
          </Field>
          <Field label="Budget (USD)">
            <Input
              type="number"
              value={form.budget}
              onChange={(e) => set("budget", Number(e.target.value))}
              placeholder="500000"
            />
          </Field>
          <Field label="Purchase Intent">
            <Select
              value={form.purchaseIntent}
              onChange={(e) => set("purchaseIntent", e.target.value as NewLeadInput["purchaseIntent"])}
              options={[
                { label: "High", value: "High" },
                { label: "Medium", value: "Medium" },
                { label: "Low", value: "Low" },
              ]}
            />
          </Field>
          <Field label="Timeline" className="col-span-2">
            <Select
              value={form.timeline}
              onChange={(e) => set("timeline", e.target.value)}
              options={TIMELINES.map((t) => ({ label: t, value: t }))}
            />
          </Field>
        </div>

        <div className="mt-2 flex justify-end gap-2">
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={!valid}>Add Lead</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}
