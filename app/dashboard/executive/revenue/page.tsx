import { AnalyticsBars, AnalyticsDailyArea } from "@/components/dashboard/analytics-bars";
import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveRevenuePage({
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

  const focusKeys = new Set(["revenue", "orders", "average_order_value", "top_channel"]);
  const kpis = overview.kpis.filter((k) => focusKeys.has(k.key));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Revenue &amp; orders</h1>
        <p className="text-sm text-muted-foreground">{overview.rangeLabel}</p>
      </header>
      <ExecutiveFilterBar
        filters={filters}
        basePath="/dashboard/executive/revenue"
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
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue trend</CardTitle>
            <CardDescription>Net revenue per day in the window.</CardDescription>
          </CardHeader>
          <CardContent>
            {overview.dailyRevenue.length === 0 ? (
              <p className="text-sm text-muted-foreground">No revenue yet for this window.</p>
            ) : (
              <AnalyticsDailyArea
                data={overview.dailyRevenue}
                formatValue={(n) => `$${n.toFixed(0)}`}
              />
            )}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Channel mix</CardTitle>
            <CardDescription>Net revenue by channel.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={overview.channelMix.map((c) => ({ label: c.channel, value: c.revenue }))}
              formatValue={(n) => `$${n.toFixed(0)}`}
              emptyText="No orders in the window."
            />
          </CardContent>
        </Card>
      </section>
      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top products</CardTitle>
            <CardDescription>Units sold in the window.</CardDescription>
          </CardHeader>
          <CardContent>
            <AnalyticsBars
              rows={overview.topProducts.map((p) => ({ label: p.title, value: p.quantity }))}
              emptyText="No order items."
            />
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Fulfillment mix</CardTitle>
            <CardDescription>Pickup vs. delivery share.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Detailed fulfillment breakdown lives in{" "}
              <a className="text-primary underline-offset-4 hover:underline" href="/dashboard/analytics/orders">
                Order analytics
              </a>
              .
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
