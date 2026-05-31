"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft } from "lucide-react";
import { ALL_NAV_ITEMS } from "@/lib/nav";
import { useStore } from "@/lib/store/store";
import { cn } from "@/lib/utils";

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const leads = useStore((s) => s.leads);
  const properties = useStore((s) => s.properties);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pages = ALL_NAV_ITEMS.filter((i) => !q || i.label.toLowerCase().includes(q)).map((i) => ({
      kind: "Page" as const,
      label: i.label,
      href: i.href,
    }));
    if (!q) return { pages: pages.slice(0, 6), leads: [], properties: [] };
    return {
      pages: pages.slice(0, 4),
      leads: leads
        .filter((l) => l.name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q))
        .slice(0, 5)
        .map((l) => ({ kind: "Lead" as const, label: l.name, sub: l.email, href: `/leads/${l.id}` })),
      properties: properties
        .filter((p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q))
        .slice(0, 4)
        .map((p) => ({ kind: "Property" as const, label: p.name, sub: p.address, href: `/properties/${p.id}` })),
    };
  }, [query, leads, properties]);

  const go = (href: string) => {
    setOpen(false);
    setQuery("");
    router.push(href);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2.5 rounded-lg border border-border bg-secondary/50 px-3 text-sm text-muted-foreground transition-colors hover:border-border-strong"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search leads, pages…</span>
        <kbd className="hidden rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] sm:inline-block">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-[12vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="glass relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border-border-strong">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search leads, properties, pages…"
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">ESC</kbd>
            </div>
            <div className="no-scrollbar max-h-[50vh] overflow-y-auto p-2">
              <Group title="Pages" items={results.pages} onSelect={go} />
              {results.leads.length > 0 && <Group title="Leads" items={results.leads} onSelect={go} />}
              {results.properties.length > 0 && (
                <Group title="Properties" items={results.properties} onSelect={go} />
              )}
              {query && !results.leads.length && !results.properties.length && !results.pages.length && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No results found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Group({
  title,
  items,
  onSelect,
}: {
  title: string;
  items: { label: string; sub?: string; href: string; kind: string }[];
  onSelect: (href: string) => void;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-1">
      <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        {title}
      </p>
      {items.map((it) => (
        <button
          key={it.href}
          onClick={() => onSelect(it.href)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
          )}
        >
          <span className="flex-1 truncate">
            {it.label}
            {it.sub && <span className="ml-2 text-xs text-muted-foreground">{it.sub}</span>}
          </span>
          <CornerDownLeft className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ))}
    </div>
  );
}
