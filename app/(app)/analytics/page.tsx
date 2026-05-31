"use client";

import { useStore } from "@/lib/store/store";
import { computePipeline, supportStats } from "@/lib/store/selectors";
import { PageHeader, SectionTitle } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { AreaTrend, BarTrend, Donut, LineTrend } from "@/components/charts/charts";
import { FadeIn } from "@/components/shared/motion";
import { formatCurrency } from "@/lib/utils";

export default function AnalyticsPage() {
  const series = useStore((s) => s.series);
  const leads = useStore((s) => s.leads);
  const tickets = useStore((s) => s.tickets);
  const pipeline = computePipeline(leads);
  const support = supportStats(tickets);

  const totalSources = series.leadSources.reduce((s, p) => s + (p.value as number), 0);
  const apptTotals = series.appointments.reduce(
    (acc, p) => ({
      booked: acc.booked + (p.booked as number),
      attended: acc.attended + (p.attended as number),
      noShow: acc.noShow + (p.noShow as number),
    }),
    { booked: 0, attended: 0, noShow: 0 },
  );
  const attendanceRate = Math.round((apptTotals.attended / apptTotals.booked) * 100);
  const noShowRate = Math.round((apptTotals.noShow / apptTotals.booked) * 100);

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Actionable business intelligence across the pipeline." />

      <Tabs defaultValue="lead">
        <TabsList>
          <TabsTrigger value="lead">Leads</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="appointment">Appointments</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
        </TabsList>

        {/* LEADS */}
        <TabsContent value="lead">
          <div className="grid gap-4 lg:grid-cols-3">
            <FadeIn className="lg:col-span-2">
              <Card className="p-5">
                <SectionTitle hint="Volume vs qualified">Lead Volume</SectionTitle>
                <AreaTrend
                  data={series.leadVolume}
                  height={280}
                  series={[
                    { key: "leads", label: "Leads", color: "var(--chart-2)" },
                    { key: "qualified", label: "Qualified", color: "var(--chart-1)" },
                  ]}
                />
              </Card>
            </FadeIn>
            <FadeIn delay={0.05}>
              <Card className="p-5">
                <SectionTitle>Lead Sources</SectionTitle>
                <Donut
                  data={series.leadSources.map((s) => ({ label: s.label as string, value: s.value as number }))}
                  centerValue={totalSources.toLocaleString()}
                  centerLabel="Total"
                />
              </Card>
            </FadeIn>
            <FadeIn delay={0.1} className="lg:col-span-3">
              <Card className="p-5">
                <SectionTitle hint="Monthly %">Conversion Rate</SectionTitle>
                <LineTrend data={series.conversion} height={240} series={[{ key: "rate", label: "Conversion", color: "var(--chart-1)" }]} formatter={(v) => `${v}%`} />
              </Card>
            </FadeIn>
          </div>
        </TabsContent>

        {/* REVENUE */}
        <TabsContent value="revenue">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Pipeline Value" value={formatCurrency(pipeline.current, true)} accent="text-foreground" />
            <Stat label="Forecast Revenue" value={formatCurrency(pipeline.forecast, true)} accent="text-primary" />
            <Stat label="Monthly Growth" value={`+${pipeline.growth}%`} accent="text-success" />
            <Stat label="Closed (YTD)" value={formatCurrency(leads.filter((l) => l.status === "Won").reduce((s, l) => s + l.estimatedValue, 0), true)} accent="text-info" />
          </div>
          <FadeIn>
            <Card className="p-5">
              <SectionTitle hint="Closed vs forecast ($k)">Revenue Pipeline</SectionTitle>
              <AreaTrend
                data={series.revenue}
                height={300}
                series={[
                  { key: "closed", label: "Closed", color: "var(--chart-1)" },
                  { key: "forecast", label: "Forecast", color: "var(--chart-2)" },
                ]}
                formatter={(v) => `$${v}k`}
              />
            </Card>
          </FadeIn>
        </TabsContent>

        {/* APPOINTMENTS */}
        <TabsContent value="appointment">
          <div className="mb-4 grid grid-cols-3 gap-3">
            <Stat label="Booking Total" value={`${apptTotals.booked}`} accent="text-foreground" />
            <Stat label="Attendance Rate" value={`${attendanceRate}%`} accent="text-success" />
            <Stat label="No-Show Rate" value={`${noShowRate}%`} accent="text-danger" />
          </div>
          <FadeIn>
            <Card className="p-5">
              <SectionTitle hint="Booked · attended · no-show">Appointment Trends</SectionTitle>
              <BarTrend
                data={series.appointments}
                height={300}
                series={[
                  { key: "booked", label: "Booked", color: "var(--chart-2)" },
                  { key: "attended", label: "Attended", color: "var(--chart-1)" },
                  { key: "noShow", label: "No-Show", color: "var(--chart-5)" },
                ]}
              />
            </Card>
          </FadeIn>
        </TabsContent>

        {/* SUPPORT */}
        <TabsContent value="support">
          <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Resolution Rate" value={`${support.resolutionRate}%`} accent="text-success" />
            <Stat label="Avg Resolution" value={`${support.avgResponse}s`} accent="text-info" />
            <Stat label="Escalation Rate" value={`${support.escalationRate}%`} accent="text-warning" />
            <Stat label="Satisfaction" value={`${support.csat}%`} accent="text-violet" />
          </div>
          <FadeIn>
            <Card className="p-5">
              <SectionTitle hint="Resolved vs escalated">Support Volume</SectionTitle>
              <BarTrend
                data={series.support}
                height={300}
                stacked
                series={[
                  { key: "resolved", label: "Resolved", color: "var(--chart-1)" },
                  { key: "escalated", label: "Escalated", color: "var(--chart-5)" },
                ]}
              />
            </Card>
          </FadeIn>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`tabular mt-1 text-xl font-semibold ${accent}`}>{value}</p>
    </Card>
  );
}
