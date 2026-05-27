import Link from "next/link";

import { PrintButton } from "@/components/dashboard/reports/print-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters, serialiseFilters } from "@/lib/analytics/filters";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
import {
  listOpenExecutiveInsights,
  loadExecutiveOverview,
} from "@/services/executive/executive-dashboard-service";

function fmtMoney(n: number): string {
  return `$${n.toFixed(2)}`;
}

function fmtPct(n: number | null): string {
  return n == null ? "—" : `${(n * 100).toFixed(1)}%`;
}

export default async function ExecutiveReportPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const access = await requireExecutivePageAccess("executive.export");
  if (!access.ok) return access.deny;
  const { actor } = access;
  const dataUserId = actor.userId;
  const filters = parseAnalyticsFilters(sp);
  const filtersQuery = serialiseFilters(filters).toString();

  const [overview, insights] = await Promise.all([
    loadExecutiveOverview({ userId: dataUserId }, filters),
    listOpenExecutiveInsights({ userId: dataUserId }),
  ]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-2 print:break-after-avoid">
        <div>
          <h1 className="text-2xl font-semibold">Executive report</h1>
          <p className="text-sm text-muted-foreground">{overview.rangeLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <PrintButton />
          <Link
            href={`/api/export/report?key=executive_weekly_summary&${filtersQuery}`}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            Download CSV
          </Link>
        </div>
      </header>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Business health</CardTitle>
          <CardDescription>
            Operational estimate — score {overview.health.score} / 100 · {overview.health.status}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{overview.health.explanation}</p>
          {overview.health.contributions.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {overview.health.contributions.slice(0, 3).map((c) => (
                <li key={c.key}>
                  <span className="font-medium text-foreground">−{c.deduction}</span> {c.label}: {c.reason}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Key performance indicators</CardTitle>
          <CardDescription>{overview.rangeLabel}</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/80 text-left text-muted-foreground">
                <th className="px-2 py-1 font-medium">Metric</th>
                <th className="px-2 py-1 text-right font-medium">Value</th>
                <th className="px-2 py-1 font-medium">Context</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Net revenue" value={fmtMoney(overview.netRevenue)} context={`prev ${fmtMoney(overview.previousNetRevenue)}`} />
              <Row label="Orders" value={String(overview.orderCount)} context={`prev ${overview.previousOrderCount} · ${overview.cancelledOrderCount} cancelled`} />
              <Row label="Average order value" value={overview.aov == null ? "—" : fmtMoney(overview.aov)} context={overview.previousAov == null ? "—" : `prev ${fmtMoney(overview.previousAov)}`} />
              <Row label="Repeat rate" value={fmtPct(overview.repeatRate)} context={fmtPct(overview.previousRepeatRate)} />
              <Row label="New customers" value={String(overview.newCustomerCount)} context="First order in window" />
              <Row label="Top channel" value={overview.topChannel?.channel ?? "—"} context={overview.topChannel ? fmtMoney(overview.topChannel.revenue) : "—"} />
              <Row label="Production completion" value={fmtPct(overview.productionCompletion)} context={`${overview.productionCompleted}/${overview.productionTotal} items`} />
              <Row label="Packing accuracy" value={fmtPct(overview.packingAccuracy)} context={`${overview.packed}/${overview.packingTotal} items`} />
              <Row label="Delivery on-time" value={fmtPct(overview.deliveryCompletion)} context={`${overview.deliveredStops}/${overview.deliveryStops} stops`} />
              <Row label="Margin estimate" value={fmtPct(overview.marginMedian)} context="Operational estimate" />
              <Row label="Inventory alerts" value={String(overview.inventoryShortages)} context={`${overview.imminentShortages} within 3 days`} />
              <Row label="Purchasing needs" value={String(overview.purchasingNeeds)} context={`${overview.stalePurchaseOrders} stale > 7d`} />
              <Row label="Overdue tasks" value={String(overview.overdueTasks)} context={`${overview.openTasks} open total`} />
              <Row label="Catering pipeline" value={`${overview.cateringOpenPipeline} open · ${fmtMoney(overview.cateringAcceptedRevenue)} accepted`} context={`${overview.cateringAccepted} accepted`} />
              <Row label="Meal plan recurring" value={fmtMoney(overview.mealPlanWeeklyRecurring)} context={`${overview.mealPlanActive} active plans`} />
              <Row label="Top brand" value={overview.topBrand?.name ?? "—"} context={overview.topBrand ? fmtMoney(overview.topBrand.revenue) : "—"} />
              <Row label="Top location" value={overview.topLocation?.name ?? "—"} context={overview.topLocation ? fmtMoney(overview.topLocation.revenue) : "—"} />
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Risks &amp; next actions</CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open risks.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {insights.map((i) => (
                <li key={i.id} className="rounded-md border border-border/60 p-3">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-xs text-muted-foreground">{i.description}</p>
                  {i.actionRoute && (
                    <Link
                      className="text-xs text-primary hover:underline print:hidden"
                      href={i.actionRoute}
                    >
                      {i.actionLabel ?? "Open"} →
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Module drilldowns</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2 print:hidden">
          <Link className="text-primary hover:underline" href="/dashboard/analytics">Analytics command center</Link>
          <Link className="text-primary hover:underline" href="/dashboard/reports">Reports center</Link>
          <Link className="text-primary hover:underline" href="/dashboard/orders">Order hub</Link>
          <Link className="text-primary hover:underline" href="/dashboard/production">Production</Link>
          <Link className="text-primary hover:underline" href="/dashboard/packing">Packing</Link>
          <Link className="text-primary hover:underline" href="/dashboard/routes">Routes</Link>
          <Link className="text-primary hover:underline" href="/dashboard/costing">Costing</Link>
          <Link className="text-primary hover:underline" href="/dashboard/inventory/demand">Ingredient demand</Link>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground print:hidden">
        Use your browser&apos;s print dialog (Cmd/Ctrl-P) to save this report as a PDF. Server-side PDF
        generation is intentionally not enabled to keep the experience honest.
      </p>
    </div>
  );
}

function Row({ label, value, context }: { label: string; value: string; context: string }) {
  return (
    <tr className="border-b border-border/40">
      <td className="px-2 py-1">{label}</td>
      <td className="px-2 py-1 text-right tabular-nums">{value}</td>
      <td className="px-2 py-1 text-muted-foreground">{context}</td>
    </tr>
  );
}
