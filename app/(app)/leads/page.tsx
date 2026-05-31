"use client";

import { useStore } from "@/lib/store/store";
import { statusCounts } from "@/lib/store/selectors";
import { LeadsTable } from "@/components/leads/leads-table";
import { AddLeadDialog } from "@/components/leads/add-lead-dialog";
import { PageHeader } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/shared/motion";

export default function LeadsPage() {
  const leads = useStore((s) => s.leads);
  const counts = statusCounts(leads);

  const pills: { label: string; value: number; color: string }[] = [
    { label: "Total", value: leads.length, color: "text-foreground" },
    { label: "New", value: counts.New, color: "text-info" },
    { label: "Qualified", value: counts.Qualified, color: "text-primary" },
    { label: "Negotiation", value: counts.Negotiation, color: "text-warning" },
    { label: "Won", value: counts.Won, color: "text-success" },
  ];

  return (
    <div>
      <PageHeader
        title="Lead Management"
        subtitle="Your AI-powered CRM — every prospect, qualified and tracked."
        live
        actions={<AddLeadDialog />}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {pills.map((p, i) => (
          <FadeIn key={p.label} delay={i * 0.04}>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">{p.label}</p>
              <p className={`tabular mt-1 text-2xl font-semibold ${p.color}`}>{p.value}</p>
            </Card>
          </FadeIn>
        ))}
      </div>

      <FadeIn delay={0.1}>
        <LeadsTable />
      </FadeIn>
    </div>
  );
}
