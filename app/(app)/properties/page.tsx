"use client";

import { useState } from "react";
import Link from "next/link";
import { Bath, BedDouble, Maximize, Users } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { AddPropertyDialog } from "@/components/properties/add-property-dialog";
import { PageHeader } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { FadeIn } from "@/components/shared/motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { PropertyStatus } from "@/lib/types";

const FILTERS: ("All" | PropertyStatus)[] = ["All", "Available", "Reserved", "Under Contract", "Sold"];

export default function PropertiesPage() {
  const properties = useStore((s) => s.properties);
  const [filter, setFilter] = useState<"All" | PropertyStatus>("All");
  const rows = filter === "All" ? properties : properties.filter((p) => p.status === filter);

  return (
    <div>
      <PageHeader
        title="Property Management"
        subtitle="Available inventory and buyer interest."
        actions={<AddPropertyDialog />}
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs transition-colors",
              filter === f ? "border-primary/40 bg-primary/15 text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((p, i) => (
          <FadeIn key={p.id} delay={(i % 6) * 0.04}>
            <Link href={`/properties/${p.id}`}>
              <Card className="glass-hover overflow-hidden p-0">
                <div className="relative h-36" style={{ background: p.gradient }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute right-3 top-3"><StatusBadge value={p.status} /></div>
                  <div className="absolute bottom-3 left-3">
                    <p className="tabular text-lg font-semibold text-white">{formatCurrency(p.price)}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><BedDouble className="size-3.5" /> {p.bedrooms}</span>
                    <span className="flex items-center gap-1"><Bath className="size-3.5" /> {p.bathrooms}</span>
                    <span className="flex items-center gap-1"><Maximize className="size-3.5" /> {p.sqft.toLocaleString()}</span>
                    <span className="ml-auto flex items-center gap-1"><Users className="size-3.5" /> {p.interestedLeadIds.length}</span>
                  </div>
                </div>
              </Card>
            </Link>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
