"use client";

import { CalendarCheck, CalendarClock, CalendarX, Repeat } from "lucide-react";
import { useStore } from "@/lib/store/store";
import { Calendar } from "@/components/appointments/calendar";
import { PageHeader } from "@/components/shared/bits";
import { KpiCard } from "@/components/shared/kpi-card";
import { FadeIn, Reveal, Stagger } from "@/components/shared/motion";

export default function AppointmentsPage() {
  const appts = useStore((s) => s.appointments);

  const count = (s: string) => appts.filter((a) => a.status === s).length;

  return (
    <div>
      <PageHeader title="Appointments" subtitle="AI-scheduled meetings across your team." live />

      <Stagger className="mb-4 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Reveal><KpiCard label="Confirmed" value={count("Confirmed")} icon={CalendarCheck} accent="info" /></Reveal>
        <Reveal><KpiCard label="Pending" value={count("Pending")} icon={CalendarClock} accent="warning" /></Reveal>
        <Reveal><KpiCard label="Completed" value={count("Completed")} icon={CalendarCheck} accent="success" /></Reveal>
        <Reveal><KpiCard label="Rescheduled" value={count("Rescheduled") + count("Cancelled")} icon={Repeat} accent="violet" /></Reveal>
      </Stagger>

      <FadeIn delay={0.1}>
        <Calendar />
      </FadeIn>
    </div>
  );
}
