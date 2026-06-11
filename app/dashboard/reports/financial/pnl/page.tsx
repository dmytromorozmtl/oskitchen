import Link from "next/link";

import { PnlRefreshButton } from "@/components/dashboard/pnl-refresh-button";
import { RestaurantPnLChart } from "@/components/dashboard/restaurant-pnl-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { canExportReports } from "@/lib/reports/report-export-access";
import { requireReportsPageAccess } from "@/lib/reports/reports-page-access";
import {
  getRestaurantPnLStatement,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";
import {
  listPnlSnapshotsPage,
  refreshPnlSnapshot,
} from "@/services/accounting/pnl-snapshot-service";

const PERIODS: { key: PnlPeriod; label: string }[] = [
  { key: "today", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "quarter", label: "Quarter" },
  { key: "year", label: "Year" },
];

export default async function RestaurantPnLPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; cursor?: string; refresh?: string }>;
}) {
  const { period: raw, cursor, refresh } = await searchParams;
  const valid: PnlPeriod[] = ["today", "week", "month", "quarter", "year"];
  const period: PnlPeriod = valid.includes(raw as PnlPeriod) ? (raw as PnlPeriod) : "month";
  const access = await requireReportsPageAccess("reports.read.financial");
  if (!access.ok) {
    return access.deny;
  }
  const { actor } = access;
  const { userId } = actor;
  if (refresh === "1") {
    await refreshPnlSnapshot(userId, period);
  }
  const canExport = canExportReports(actor);
  const snapshotPage = await listPnlSnapshotsPage(userId, cursor ?? null);
  const { summary, lines } = await getRestaurantPnLStatement(userId, period);

  const chartData = [
    { label: "Food", actual: summary.foodCostPct, target: summary.targets.foodCostPct },
    { label: "Labor", actual: summary.laborCostPct, target: summary.targets.laborCostPct },
    { label: "Prime", actual: summary.primeCostPct, target: summary.targets.primeCostPct },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Restaurant P&amp;L</h1>
          <p className="text-sm text-muted-foreground">
            Chart of accounts · budget vs actual · prime cost
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PnlRefreshButton period={period} />
          {canExport && (
            <a
              href={`/api/export/restaurant-pnl?period=${period}`}
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
              Export CSV
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <Link
            key={p.key}
            href={`/dashboard/reports/financial/pnl?period=${p.key}`}
            className={`rounded-md px-3 py-1.5 text-sm ${
              period === p.key
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prime cost</CardTitle>
          <CardDescription>Targets: 30% food · 30% labor · 60% prime</CardDescription>
        </CardHeader>
        <CardContent>
          <RestaurantPnLChart data={chartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">P&amp;L statement</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-2 pr-4">Line</th>
                <th className="py-2 pr-4 text-right">Actual</th>
                <th className="py-2 pr-4 text-right">Budget</th>
                <th className="py-2 text-right">Variance</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((l) => (
                <tr
                  key={l.key}
                  className={`border-b border-border/60 ${l.isSubtotal ? "font-semibold bg-muted/30" : ""}`}
                >
                  <td className="py-2 pr-4">{l.label}</td>
                  <td className="py-2 pr-4 text-right">${l.actual.toLocaleString()}</td>
                  <td className="py-2 pr-4 text-right">${l.budget.toLocaleString()}</td>
                  <td className={`py-2 text-right ${l.variance > 0 ? "text-destructive" : "text-green-600"}`}>
                    {l.variance >= 0 ? "+" : ""}
                    {l.variance.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Snapshot history (async pagination)</CardTitle>
          <CardDescription>Pre-aggregated rows for fast dashboards — {snapshotPage.total} stored</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {snapshotPage.items.map((s) => (
            <div key={s.id} className="flex flex-wrap justify-between gap-2 rounded-lg border px-3 py-2">
              <span className="font-medium">{s.periodKey}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.periodStart} → {s.periodEnd} · {s.status}
              </span>
            </div>
          ))}
          {snapshotPage.nextCursor ? (
            <Link
              href={`/dashboard/reports/financial/pnl?period=${period}&cursor=${snapshotPage.nextCursor}`}
              className="inline-block text-primary hover:underline"
            >
              Next page →
            </Link>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
