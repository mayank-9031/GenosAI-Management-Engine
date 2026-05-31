import { Badge, type BadgeProps } from "@/components/ui/badge";

type Variant = NonNullable<BadgeProps["variant"]>;

const MAP: Record<string, Variant> = {
  // Lead statuses
  New: "info",
  Contacted: "violet",
  Qualified: "primary",
  "Appointment Scheduled": "warning",
  Negotiation: "warning",
  Won: "success",
  Lost: "danger",
  // Appointment statuses
  Pending: "warning",
  Confirmed: "info",
  Completed: "success",
  Cancelled: "danger",
  Rescheduled: "violet",
  // Ticket statuses
  Open: "info",
  "AI Handling": "primary",
  Escalated: "danger",
  Resolved: "success",
  // Call outcomes
  "Follow-Up Needed": "warning",
  "Appointment Booked": "success",
  Unqualified: "muted",
  "No Answer": "muted",
  // Property statuses
  Available: "success",
  Reserved: "warning",
  "Under Contract": "info",
  Sold: "muted",
  // Sentiment / intent
  Positive: "success",
  Neutral: "muted",
  Negative: "danger",
  High: "success",
  Medium: "warning",
  Low: "muted",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <Badge variant={MAP[value] ?? "default"} className={className}>
      {value}
    </Badge>
  );
}
