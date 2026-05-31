import {
  BarChart3,
  Building2,
  CalendarDays,
  LayoutDashboard,
  LifeBuoy,
  PhoneCall,
  Settings,
  Sparkles,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const NAV: NavSection[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Sales",
    items: [
      { label: "Lead Management", href: "/leads", icon: Users },
      { label: "AI Calling", href: "/calling", icon: PhoneCall },
      { label: "Appointments", href: "/appointments", icon: CalendarDays },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Customer Support", href: "/support", icon: LifeBuoy },
      { label: "Properties", href: "/properties", icon: Building2 },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
      { label: "AI Insights", href: "/insights", icon: Sparkles },
      { label: "Team", href: "/team", icon: Trophy },
    ],
  },
  {
    title: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV.flatMap((s) => s.items);
