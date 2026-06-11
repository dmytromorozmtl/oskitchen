import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { CostingVarianceCard } from "@/components/executive/costing-variance-card";
import { HealthScoreCard } from "@/components/dashboard/executive/health-score-card";
import { InsightList } from "@/components/dashboard/executive/insight-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EXECUTIVE_DEMO_DISCLAIMER,
  getExecutiveDashboardDemoSnapshot,
} from "@/lib/demo/executive-dashboard-demo-data";

export default function ExecutiveDashboardDemoPage() {
  const demo = getExecutiveDashboardDemoSnapshot();

  return (
    <div className="space-y-6">
      <div
        role="status"
        data-testid="executive-dashboard-demo-banner"
        className="flex items-start gap-3 rounded-lg border border-amber-300/70 bg-amber-50 px-4 py-3 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-50"
      >
        <BarChart3 className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
        <div className="space-y-1">
          <p className="font-medium">Executive dashboard demo — synthetic data</p>
          <p className="text-sm opacity-90">{EXECUTIVE_DEMO_DISCLAIMER}</p>
        </div>
      </div>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold tracking-tight">Executive dashboard demo</h1>
            <Badge variant="outline" className="rounded-full text-[10px] uppercase tracking-wide">
              Sample
            </Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Owner-level snapshot for sales and design-partner walkthroughs — same layout as the live executive
            dashboard with illustrative KPIs, health score, and insights.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{demo.rangeLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button asChild size="sm" className="rounded-full">
            <Link href="/dashboard/executive">Open live executive dashboard</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href="/dashboard/analytics">Analytics overview</Link>
          </Button>
        </div>
      </header>

      <CostingVarianceCard summary={demo.costingVarianceAlerts} />

      <section className="grid gap-4 lg:grid-cols-3">
        <HealthScoreCard health={demo.health} />
        <Card className="border-border/80 shadow-sm lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Owner focus</CardTitle>
            <CardDescription>{demo.rangeLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              {demo.focusBullets.map((bullet) => (
                <li key={bullet} className="rounded-md bg-muted/50 px-3 py-2 text-foreground">
                  {bullet}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {demo.kpis.slice(0, 8).map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {demo.kpis.slice(8).map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Sample net revenue per day in the demo window.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsDailyArea data={demo.dailyRevenue} formatValue={(n) => `$${n.toLocaleString()}`} />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top products</CardTitle>
            <CardDescription>Units sold in the sample window.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={demo.topProducts.map((p) => ({ label: p.title, value: p.quantity }))}
              formatValue={(n) => `${n} units`}
            />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Risks &amp; next actions</h2>
        <InsightList insights={demo.insights} canManage={false} />
      </section>

      <p className="text-xs text-muted-foreground">
        Label as “sample executive dashboard” in decks and public materials. Live metrics require operational data in
        your workspace.
      </p>
    </div>
  );
}
