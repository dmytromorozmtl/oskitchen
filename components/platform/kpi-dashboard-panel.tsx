import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { KpiMetricSnapshot } from "@/lib/platform/kpi-dashboard-metrics";
import type { KpiDashboardSnapshot } from "@/services/platform/kpi-dashboard-service";

function statusBadge(status: KpiMetricSnapshot["status"]) {
  if (status === "live") {
    return (
      <Badge className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">Live</Badge>
    );
  }
  if (status === "partial") {
    return <Badge className="border-amber-500/30 bg-amber-500/10 text-amber-200">Partial</Badge>;
  }
  return <Badge className="border-zinc-600 bg-zinc-800 text-zinc-400">Awaiting data</Badge>;
}

function KpiTile({ metric }: { metric: KpiMetricSnapshot }) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/60">
      <CardHeader className="space-y-2 pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {metric.label}
          </CardTitle>
          {statusBadge(metric.status)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tabular-nums text-white">{metric.display}</p>
        <p className="mt-2 text-xs text-zinc-400">{metric.hint}</p>
        <p className="mt-1 font-mono text-[10px] text-zinc-600">{metric.source}</p>
      </CardContent>
    </Card>
  );
}

export function KpiDashboardPanel({ snapshot }: { snapshot: KpiDashboardSnapshot }) {
  const { secondary } = snapshot;

  return (
    <div className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {snapshot.metrics.map((m) => (
          <KpiTile key={m.id} metric={m} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Secondary signals</CardTitle>
            <CardDescription className="text-zinc-500">
              Context for the six core KPIs — not substitutes for Stripe or survey exports.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 px-3 py-2">
              <span className="text-xs text-zinc-500">Active subscriptions</span>
              <p className="text-lg font-semibold tabular-nums text-white">
                {secondary.activeSubscriptions.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 px-3 py-2">
              <span className="text-xs text-zinc-500">Paid revenue (30d)</span>
              <p className="text-lg font-semibold tabular-nums text-white">
                ${secondary.paidRevenue30dUsd.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 px-3 py-2">
              <span className="text-xs text-zinc-500">WAU (7d)</span>
              <p className="text-lg font-semibold tabular-nums text-white">
                {secondary.wau.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 px-3 py-2">
              <span className="text-xs text-zinc-500">NPS responses</span>
              <p className="text-lg font-semibold tabular-nums text-white">
                {secondary.npsResponses.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/60">
          <CardHeader>
            <CardTitle className="text-base text-white">Related platform views</CardTitle>
            <CardDescription className="text-zinc-500">
              Drill into revenue, health, and growth modules from here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 text-sm">
            <Link
              href="/platform/revenue"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              Revenue (Stripe)
            </Link>
            <Link
              href="/platform/system-health"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              System health
            </Link>
            <Link
              href="/platform/growth-crm"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              Growth CRM
            </Link>
            <Link
              href="/dashboard/growth"
              className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800"
            >
              Owner growth center
            </Link>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-zinc-600">
        Snapshot captured {snapshot.capturedAt.slice(0, 19)}Z · Policy{" "}
        <span className="font-mono">kpi-dashboard-absolute-final-v1</span>
      </p>
    </div>
  );
}
