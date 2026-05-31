"use client";

import {
  Bot,
  Calendar,
  MessageSquare,
  Plug,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { useStore } from "@/lib/store/store";
import { PageHeader, SectionTitle } from "@/components/shared/bits";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FadeIn } from "@/components/shared/motion";
import type { Integration } from "@/lib/types";

const CATEGORY_ICON = {
  CRM: Plug,
  Calendar: Calendar,
  Communication: MessageSquare,
  AI: Bot,
} as const;

export default function SettingsPage() {
  const integrations = useStore((s) => s.integrations);
  const toggle = useStore((s) => s.toggleIntegration);
  const aiConfig = useStore((s) => s.aiConfig);
  const updateAiConfig = useStore((s) => s.updateAiConfig);
  const resetData = useStore((s) => s.resetData);

  const grouped = integrations.reduce<Record<string, Integration[]>>((acc, it) => {
    (acc[it.category] ??= []).push(it);
    return acc;
  }, {});

  const connectedCount = integrations.filter((i) => i.connected).length;

  return (
    <div>
      <PageHeader
        title="Settings & Integrations"
        subtitle="Connect tools and configure your AI agents."
        actions={
          <Button variant="secondary" onClick={resetData}>
            <RotateCcw /> Reset Demo Data
          </Button>
        }
      />

      <Tabs defaultValue="integrations">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="primary">{connectedCount} connected</Badge>
            <span>of {integrations.length} available</span>
          </div>
          <div className="space-y-5">
            {Object.entries(grouped).map(([cat, items]) => {
              const Icon = CATEGORY_ICON[cat as keyof typeof CATEGORY_ICON] ?? Plug;
              return (
                <FadeIn key={cat}>
                  <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-3.5" /> {cat}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {items.map((it) => (
                        <Card key={it.id} className="flex items-center justify-between p-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{it.name}</p>
                              {it.connected && <span className="size-1.5 rounded-full bg-success" />}
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{it.description}</p>
                          </div>
                          <Switch checked={it.connected} onCheckedChange={() => toggle(it.id)} />
                        </Card>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="ai">
          <div className="grid gap-4 lg:grid-cols-2">
            <FadeIn>
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <SectionTitle className="mb-0">Qualification Questions</SectionTitle>
                </div>
                <div className="space-y-2">
                  {aiConfig.qualificationQuestions.map((q, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-secondary/30 px-3 py-2 text-sm">
                      <span className="flex size-5 items-center justify-center rounded-full bg-primary/15 text-[10px] text-primary">{i + 1}</span>
                      {q}
                    </div>
                  ))}
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.05}>
              <Card className="p-5">
                <SectionTitle>Scoring Rules</SectionTitle>
                <div className="space-y-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Score to Qualify</span>
                      <span className="tabular font-semibold text-primary">{aiConfig.minScoreToQualify}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={aiConfig.minScoreToQualify}
                      onChange={(e) => updateAiConfig({ minScoreToQualify: Number(e.target.value) })}
                      className="w-full accent-[var(--primary)]"
                    />
                  </div>
                  <Field label="Support Tone">
                    <Select
                      value={aiConfig.supportTone}
                      onChange={(e) => updateAiConfig({ supportTone: e.target.value as typeof aiConfig.supportTone })}
                      options={[
                        { label: "Friendly", value: "Friendly" },
                        { label: "Professional", value: "Professional" },
                        { label: "Concise", value: "Concise" },
                      ]}
                    />
                  </Field>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Calendar className="size-4 text-warning" />
                  <SectionTitle className="mb-0">Appointment Rules</SectionTitle>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">Auto-book appointments</p>
                      <p className="text-xs text-muted-foreground">Let AI schedule meetings automatically</p>
                    </div>
                    <Switch
                      checked={aiConfig.autoBookAppointments}
                      onCheckedChange={(v) => updateAiConfig({ autoBookAppointments: v })}
                    />
                  </div>
                  <Field label="Working Hours">
                    <Input
                      value={aiConfig.workingHours}
                      onChange={(e) => updateAiConfig({ workingHours: e.target.value })}
                    />
                  </Field>
                </div>
              </Card>
            </FadeIn>

            <FadeIn delay={0.15}>
              <Card className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquare className="size-4 text-info" />
                  <SectionTitle className="mb-0">Support Responses</SectionTitle>
                </div>
                <Field label={`Auto-escalate after (${aiConfig.autoEscalateAfterMin} min)`}>
                  <input
                    type="range"
                    min={1}
                    max={60}
                    value={aiConfig.autoEscalateAfterMin}
                    onChange={(e) => updateAiConfig({ autoEscalateAfterMin: Number(e.target.value) })}
                    className="w-full accent-[var(--primary)]"
                  />
                </Field>
                <p className="mt-2 text-xs text-muted-foreground">
                  Conversations the AI can&apos;t resolve will be handed to a human agent after this window.
                </p>
              </Card>
            </FadeIn>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
