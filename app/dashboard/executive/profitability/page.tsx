import Link from "next/link";

import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveProfitabilityPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const access = await requireExecutivePageAccess("executive.read.financial");
  if (!access.ok) return access.deny;
  const { actor } = access;
  const dataUserId = actor.userId;
  const user = { id: actor.sessionUserId };
  const filters = parseAnalyticsFilters(sp);
  const [overview, brands, locations] = await Promise.all([
    loadExecutiveOverview({ userId: dataUserId }, filters),
    prisma.brand.findMany({
      where: { workspace: { ownerUserId: user.id } },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      where: { userId: dataUserId },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  const focusKeys = new Set([
    "margin_estimate",
    "meal_plan_recurring",
    "catering_pipeline",
    "purchasing_needs",
  ]);
  const kpis = overview.kpis.filter((k) => focusKeys.has(k.key));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Profitability</h1>
        <p className="text-sm text-muted-foreground">
          {overview.rangeLabel} · Margin values are operational estimates, not accounting statements.
        </p>
      </header>
      <ExecutiveFilterBar
        filters={filters}
        basePath="/dashboard/executive/profitability"
        brands={brands}
        locations={locations}
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>
      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Items below margin target</CardTitle>
            <CardDescription>From the latest costing run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{overview.marginAtRiskItems}</span> item
              {overview.marginAtRiskItems === 1 ? "" : "s"} flagged.
            </p>
            <Link href="/dashboard/costing" className="text-primary hover:underline">
              Open costing →
            </Link>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Purchasing &amp; cost signals</CardTitle>
            <CardDescription>Outstanding purchasing actions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              {overview.purchasingNeeds} open purchase order
              {overview.purchasingNeeds === 1 ? "" : "s"} · {overview.stalePurchaseOrders} stale &gt; 7 days.
            </p>
            <Link href="/dashboard/purchasing" className="text-primary hover:underline">
              Open purchasing →
            </Link>
            <p className="pt-2 text-xs text-muted-foreground">
              Cost-component breakdowns live in{" "}
              <Link className="text-primary hover:underline" href="/dashboard/costing">
                Costing
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
