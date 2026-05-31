"use client";

import Link from "next/link";
import { ArrowLeft, Bath, BedDouble, CalendarDays, Check, Maximize } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { SectionTitle, EmptyState } from "@/components/shared/bits";
import { FadeIn } from "@/components/shared/motion";
import { formatCurrency, initials } from "@/lib/utils";

export function PropertyDetail({ id }: { id: string }) {
  const property = useStore((s) => s.properties.find((p) => p.id === id));
  const leads = useStore((s) => s.leads);

  if (!property) {
    return (
      <div>
        <Back />
        <Card className="mt-4"><EmptyState title="Property not found" /></Card>
      </div>
    );
  }

  const interested = leads.filter((l) => property.interestedLeadIds.includes(l.id));
  const stats = [
    { icon: BedDouble, label: "Bedrooms", value: property.bedrooms },
    { icon: Bath, label: "Bathrooms", value: property.bathrooms },
    { icon: Maximize, label: "Square Feet", value: property.sqft.toLocaleString() },
    { icon: CalendarDays, label: "Viewings", value: property.viewingsScheduled },
  ];

  return (
    <div>
      <Back />

      <FadeIn>
        <Card className="mt-4 overflow-hidden p-0">
          <div className="relative h-52" style={{ background: property.gradient }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute right-4 top-4"><StatusBadge value={property.status} /></div>
            <div className="absolute bottom-4 left-5">
              <h1 className="text-2xl font-semibold text-white">{property.name}</h1>
              <p className="text-sm text-white/80">{property.address}</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs text-muted-foreground">List Price</p>
              <p className="tabular text-2xl font-semibold text-primary">{formatCurrency(property.price)}</p>
            </div>
            <Button>Schedule Viewing</Button>
          </div>
        </Card>
      </FadeIn>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <FadeIn delay={0.05}>
            <Card className="p-5">
              <SectionTitle>Overview</SectionTitle>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-secondary/30 p-3 text-center">
                    <s.icon className="mx-auto size-5 text-muted-foreground" />
                    <p className="tabular mt-1.5 text-lg font-semibold">{s.value}</p>
                    <p className="text-[11px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="p-5">
              <SectionTitle>Features</SectionTitle>
              <div className="flex flex-wrap gap-2">
                {property.features.map((f) => (
                  <span key={f} className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 text-sm">
                    <Check className="size-3.5 text-primary" /> {f}
                  </span>
                ))}
              </div>
            </Card>
          </FadeIn>
        </div>

        <FadeIn delay={0.12}>
          <Card className="p-5">
            <SectionTitle hint={`${interested.length}`}>Interested Leads</SectionTitle>
            {interested.length === 0 ? (
              <EmptyState title="No interested leads yet" />
            ) : (
              <div className="space-y-2">
                {interested.map((l) => (
                  <Link
                    key={l.id}
                    href={`/leads/${l.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-2.5 transition-colors hover:border-border-strong"
                  >
                    <Avatar label={initials(l.name)} size={34} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{formatCurrency(l.budget)} budget</p>
                    </div>
                    <StatusBadge value={l.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

function Back() {
  return (
    <Link href="/properties" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ArrowLeft className="size-4" /> Back to Properties
    </Link>
  );
}
