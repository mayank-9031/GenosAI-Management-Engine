"use client";

import { Bell, ChevronDown, LogOut, Menu, Settings, User } from "lucide-react";
import { CommandSearch } from "./command-search";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/lib/store/store";
import { useHydrated } from "@/lib/hooks";
import { formatRelativeTime, formatTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const notifications = useStore((s) => s.notifications);
  const now = useStore((s) => s.now);
  const markRead = useStore((s) => s.markAllNotificationsRead);
  const hydrated = useHydrated();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <button
        onClick={onMenu}
        className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="flex flex-1 items-center">
        <CommandSearch />
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-1.5 md:flex">
          <span className="live-dot size-1.5 rounded-full bg-success" />
          <span className="tabular text-xs text-muted-foreground">
            {hydrated ? formatTime(now) : "—"}
          </span>
        </div>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative rounded-lg border border-border bg-secondary/40 p-2 text-muted-foreground transition-colors hover:text-foreground">
              <Bell className="size-[18px]" />
              {unread > 0 && (
                <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {unread}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-2 py-1">
              <DropdownMenuLabel className="px-0.5">Notifications</DropdownMenuLabel>
              <button onClick={markRead} className="text-[11px] text-primary hover:underline">
                Mark all read
              </button>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex gap-2.5 rounded-lg px-2.5 py-2 hover:bg-secondary"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2 shrink-0 rounded-full",
                      n.kind === "success" && "bg-success",
                      n.kind === "warning" && "bg-warning",
                      n.kind === "info" && "bg-info",
                    )}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && <span className="size-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{n.detail}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                      {hydrated ? formatRelativeTime(n.at, now) : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg border border-border bg-secondary/40 py-1 pl-1 pr-2 transition-colors hover:border-border-strong">
              <Avatar label="MG" size={28} gradient="linear-gradient(135deg,#10d293,#45b6fe)" />
              <span className="hidden text-sm font-medium sm:inline">Mayank G.</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <Avatar label="MG" size={36} gradient="linear-gradient(135deg,#10d293,#45b6fe)" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">Mayank Goyal</p>
                <p className="truncate text-xs text-muted-foreground">Sales Manager</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger">
              <LogOut /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
