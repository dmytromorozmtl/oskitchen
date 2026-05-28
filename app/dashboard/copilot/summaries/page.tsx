import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadCopilotPageActor } from "@/lib/ux/copilot-page-access-era20";
import { canExportReports } from "@/lib/reports/report-export-access";
import { buildDeterministicSnapshot } from "@/services/ai/deterministic-insights-service";
import { generateNarrative, getCopilotSettings } from "@/services/ai/copilot-service";
import { prisma } from "@/lib/prisma";

const SUMMARIES = [
  {
    key: "daily",
    title: "Daily operations summary",
    description:
      "Throughput, blockers, and recommended next actions for today.",
    reportKey: "operations_daily_summary",
  },
  {
    key: "weekly",
    title: "Weekly executive summary",
    description:
      "Revenue, margin, customer, operations, and risk roll-up for the week.",
    reportKey: "executive_weekly_summary",
  },
  {
    key: "production",
    title: "Production risk summary",
    description: "Where production is behind schedule and likely reasons.",
    reportKey: "production_report",
  },
  {
    key: "packing",
    title: "Packing accuracy summary",
    description: "Pack-through rates and exception trends.",
    reportKey: "packing_report",
  },
  {
    key: "delivery",
    title: "Delivery readiness summary",
    description: "Route load, failed-stop counts, on-time rate.",
    reportKey: "delivery_report",
  },
  {
    key: "catering",
    title: "Catering pipeline summary",
    description: "Open quotes, accepted value, overdue follow-ups.",
    reportKey: "catering_report",
  },
  {
    key: "meal_plans",
    title: "Meal plan cycles summary",
    description: "Active subscriptions and cycles still to generate.",
    reportKey: "meal_plan_report",
  },
  {
    key: "purchasing",
    title: "Purchasing shortage summary",
    description: "Open POs, stale drafts, and imminent ingredient shortages.",
    reportKey: "purchasing_report",
  },
  {
    key: "customers",
    title: "Customer follow-up summary",
    description: "Repeat rate, at-risk customers, VIP follow-up suggestions.",
    reportKey: "customer_report",
  },
];

export default async function CopilotSummariesPage() {
  const { actor, scope } = await loadCopilotPageActor();
  const { userId } = actor;

  const canExport = canExportReports(actor);

  const [settings, profile, snapshot] = await Promise.all([
    getCopilotSettings(scope),
    prisma.userProfile.findUnique({
      where: { id: userId },
      select: { kitchenSettings: { select: { businessType: true } } },
    }),
    buildDeterministicSnapshot(userId),
  ]);

  const narrative = await generateNarrative(scope, {
    rangeLabel: snapshot.rangeLabel,
    bulletSummary: snapshot.bulletSummary,
    mode: profile?.kitchenSettings?.businessType ?? null,
    role: null,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Reports &amp; summaries</h1>
        <p className="text-sm text-muted-foreground">
          {settings.aiNarrativeEnabled && settings.hasApiKey
            ? "Each summary includes a deterministic bullet list plus an optional AI narrative."
            : "Deterministic bullet summaries — AI narrative is disabled or no API key is set."}
        </p>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s narrative</CardTitle>
          <CardDescription>{snapshot.rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">
          {narrative.text ?? snapshot.bulletSummary}
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2">
        {SUMMARIES.map((s) => (
          <Card key={s.key} className="border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">{s.title}</CardTitle>
              <CardDescription>{s.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Link
                href={`/dashboard/reports/${s.reportKey}`}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground"
              >
                Open report
              </Link>
              {canExport && (
                <Link
                  href={`/api/export/report?key=${s.reportKey}`}
                  className="rounded-md border border-border px-3 py-1.5 text-xs"
                >
                  Download CSV
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
