import Link from "next/link";
import {
  AlertTriangle,
  Brain,
  Package,
  TrendingUp,
  Users,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";

import { AiBriefingFeedback } from "@/components/dashboard/ai-briefing-feedback";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyBriefing } from "@/lib/ai/restaurant-brain-types";
import {
  buildAiBriefingSectionSummaries,
  countCriticalAiBriefingAlerts,
} from "@/lib/ai/restaurant-brain-ui-summary";
import { cn } from "@/lib/utils";

const SECTION_ICONS = {
  inventory: Package,
  labor: Users,
  menu: UtensilsCrossed,
  profit: Wallet,
  forecast: TrendingUp,
} as const;

function toneClass(tone: "critical" | "warning" | "neutral" | "positive"): string {
  switch (tone) {
    case "critical":
      return "border-red-200/80 bg-red-50/30 dark:border-red-900/40 dark:bg-red-950/15";
    case "warning":
      return "border-amber-200/70 bg-amber-50/25 dark:border-amber-900/40 dark:bg-amber-950/15";
    case "positive":
      return "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10";
    default:
      return "border-border/70 bg-background/80";
  }
}

function urgencyBadgeClass(urgency: string): string {
  if (urgency === "critical") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
  if (urgency === "warning") return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
  return "bg-muted text-muted-foreground";
}

function fmtMoney(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function confidenceLabel(value: number): string {
  return `AI confidence: ${value}%`;
}

export function AiBriefingPanel({ briefing }: { briefing: DailyBriefing }) {
  const criticalCount = countCriticalAiBriefingAlerts(briefing);
  const sections = buildAiBriefingSectionSummaries(briefing);
  const overallPct = Math.round(briefing.overallConfidence * 100);

  return (
    <section className="space-y-4" data-testid="ai-briefing-panel">
      <Card className="border-primary/20 bg-primary/[0.03] shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Brain className="h-5 w-5 text-primary" aria-hidden />
                Today&apos;s AI Briefing
              </CardTitle>
              <CardDescription className="mt-1">
                AI-assisted suggestions from inventory, labor, menu, and profit data — review before acting.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {criticalCount > 0 ? (
                <Badge className="bg-red-600 text-white hover:bg-red-600">
                  <AlertTriangle className="mr-1 h-3 w-3" aria-hidden />
                  {criticalCount} critical
                </Badge>
              ) : null}
              <Badge variant="outline">{confidenceLabel(overallPct)}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {sections.map((section) => {
            const Icon = SECTION_ICONS[section.id as keyof typeof SECTION_ICONS] ?? TrendingUp;
            return (
              <Link
                key={section.id}
                href={section.href}
                className={cn(
                  "rounded-lg border p-3 transition-colors hover:bg-muted/40",
                  toneClass(section.tone),
                )}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 shrink-0 opacity-70" aria-hidden />
                  {section.title}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{section.headline}</p>
                <p className="mt-2 text-xs text-muted-foreground">{confidenceLabel(section.confidence)}</p>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Insight details</CardTitle>
          <CardDescription>Expand a section for AI-assisted recommendations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="inventory">
              <AccordionTrigger>
                Inventory
                {briefing.inventoryAlerts.length > 0 ? (
                  <Badge variant="secondary" className="ml-2">
                    {briefing.inventoryAlerts.length}
                  </Badge>
                ) : null}
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                {briefing.inventoryAlerts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reorder alerts in the current window.</p>
                ) : (
                  briefing.inventoryAlerts.map((alert) => (
                    <div key={alert.item} className="rounded-md border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{alert.item}</span>
                        <Badge className={urgencyBadgeClass(alert.urgency)}>{alert.urgency}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {confidenceLabel(Math.round(alert.confidence * 100))}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{alert.message}</p>
                      <p className="mt-1 text-xs">
                        Stock {alert.currentStock} · {alert.daysRemaining}d left · reorder ~{alert.recommendedOrder}
                      </p>
                    </div>
                  ))
                )}
                <AiBriefingFeedback sectionId="inventory" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="labor">
              <AccordionTrigger>Labor</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {briefing.laborInsights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No labor gaps flagged for this week.</p>
                ) : (
                  briefing.laborInsights.map((insight, i) => (
                    <div key={`${insight.shift}-${i}`} className="rounded-md border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium capitalize">{insight.type.replace(/_/g, " ")}</span>
                        <span className="text-xs text-muted-foreground">
                          {confidenceLabel(Math.round(insight.confidence * 100))}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{insight.message}</p>
                      <p className="mt-1 text-xs">
                        {insight.shift} · {insight.role} · est. impact {fmtMoney(insight.impact)}
                      </p>
                    </div>
                  ))
                )}
                <AiBriefingFeedback sectionId="labor" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="menu">
              <AccordionTrigger>Menu profitability</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {briefing.menuInsights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No margin concerns from the latest costing run.</p>
                ) : (
                  briefing.menuInsights.map((item) => (
                    <div key={item.item} className="rounded-md border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{item.item}</span>
                        <Badge variant="outline">{item.trend}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {confidenceLabel(Math.round(item.confidence * 100))}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{item.recommendation}</p>
                      <p className="mt-1 text-xs">
                        Margin {item.margin.toFixed(1)}% · food cost {item.foodCost.toFixed(1)}% · WoW{" "}
                        {item.comparedToLastWeek >= 0 ? "+" : ""}
                        {item.comparedToLastWeek.toFixed(0)}%
                      </p>
                    </div>
                  ))
                )}
                <AiBriefingFeedback sectionId="menu" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="staff">
              <AccordionTrigger>Staff performance</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {briefing.staffInsights.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Connect POS staff attribution or packing data for individual insights.
                  </p>
                ) : (
                  briefing.staffInsights.map((s, i) => (
                    <div key={`${s.employee}-${s.metric}-${i}`} className="rounded-md border p-3 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{s.employee}</span>
                        <Badge variant="outline">{s.metric.replace(/_/g, " ")}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {confidenceLabel(Math.round(s.confidence * 100))}
                        </span>
                      </div>
                      <p className="mt-1 text-muted-foreground">{s.message}</p>
                      <p className="mt-1 text-xs">
                        {s.current} vs benchmark {s.benchmark} · {s.trend}
                      </p>
                    </div>
                  ))
                )}
                <AiBriefingFeedback sectionId="staff" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="profit">
              <AccordionTrigger>Profit analysis</AccordionTrigger>
              <AccordionContent className="space-y-3">
                {briefing.profitInsights.map((p) => (
                  <div key={p.factor} className="rounded-md border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.factor}</span>
                      <Badge variant="outline">{p.trend}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {confidenceLabel(Math.round(p.confidence * 100))}
                      </span>
                    </div>
                    <p className="mt-1 text-muted-foreground">{p.recommendation}</p>
                    <p className="mt-1 text-xs">
                      Impact {fmtMoney(p.impact)} · {p.percentageOfRevenue.toFixed(1)}% of revenue
                    </p>
                  </div>
                ))}
                <AiBriefingFeedback sectionId="profit" />
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="forecast">
              <AccordionTrigger>Weekly forecast</AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="rounded-md border p-3 text-sm">
                  <p className="font-medium">
                    {fmtMoney(briefing.weeklyForecast.predictedRevenue)} revenue ·{" "}
                    {briefing.weeklyForecast.predictedOrders} orders
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {confidenceLabel(Math.round(briefing.weeklyForecast.confidence * 100))}
                  </p>
                  {briefing.weeklyForecast.factors.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
                      {briefing.weeklyForecast.factors.map((f) => (
                        <li key={f.name}>
                          {f.name} ({f.impact})
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {briefing.weeklyForecast.recommendations.length > 0 ? (
                    <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                      {briefing.weeklyForecast.recommendations.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                <AiBriefingFeedback sectionId="forecast" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  );
}
