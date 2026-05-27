import { ExecutiveFilterBar } from "@/components/dashboard/executive/executive-filter-bar";
import { ExecutiveKpiCard } from "@/components/dashboard/executive/kpi-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { requireExecutivePageAccess } from "@/lib/executive/executive-page-access";
import { prisma } from "@/lib/prisma";
import { loadExecutiveOverview } from "@/services/executive/executive-dashboard-service";

export default async function ExecutiveOperationsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const access = await requireExecutivePageAccess("executive.read.operations");
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
    "production_completion",
    "packing_accuracy",
    "delivery_performance",
    "inventory_alerts",
    "overdue_tasks",
    "purchasing_needs",
  ]);
  const kpis = overview.kpis.filter((k) => focusKeys.has(k.key));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Operations</h1>
        <p className="text-sm text-muted-foreground">{overview.rangeLabel}</p>
      </header>
      <ExecutiveFilterBar
        filters={filters}
        basePath="/dashboard/executive/operations"
        brands={brands}
        locations={locations}
      />
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k) => (
          <ExecutiveKpiCard key={k.key} kpi={k} />
        ))}
      </section>
      <section className="grid gap-3 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Production</CardTitle>
            <CardDescription>Batches scheduled in the window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{overview.productionCompleted}</span> /{" "}
              {overview.productionTotal} items completed.
            </p>
            <p className="text-muted-foreground">
              {overview.overdueProductionItems} item{overview.overdueProductionItems === 1 ? "" : "s"} not yet done.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Packing</CardTitle>
            <CardDescription>Packing batches in the window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{overview.packed}</span> / {overview.packingTotal} items packed.
            </p>
            <p className="text-muted-foreground">
              Pack-through rate:{" "}
              {overview.packingAccuracy == null
                ? "—"
                : `${(overview.packingAccuracy * 100).toFixed(1)}%`}
              .
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Delivery</CardTitle>
            <CardDescription>Stops created in the window.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{overview.deliveredStops}</span> /{" "}
              {overview.deliveryStops} stops delivered.
            </p>
            <p className="text-muted-foreground">
              Failed stops: {overview.failedDeliveries}.
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tasks &amp; labour</CardTitle>
            <CardDescription>Open kitchen / operations tasks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>
              <span className="font-medium">{overview.overdueTasks}</span> overdue · {overview.openTasks} open total.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
