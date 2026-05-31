"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Zap } from "lucide-react";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_rgba(16,210,147,0.8)]">
          <Zap className="size-4" fill="currentColor" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">GenosAI</p>
          <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Sales Intelligence Platform</p>
        </div>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-secondary lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {NAV.map((section) => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground/70">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      active
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer upgrade card */}
      <div className="p-3">
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2">
            <Sparkle />
            <p className="text-xs font-semibold">AI Engine Active</p>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Agents are qualifying leads and booking meetings around the clock.
          </p>
        </div>
      </div>
    </div>
  );
}

function Sparkle() {
  return (
    <span className="relative flex size-2">
      <span className="live-dot absolute inline-flex size-2 rounded-full bg-primary" />
      <span className="relative inline-flex size-2 rounded-full bg-primary" />
    </span>
  );
}
