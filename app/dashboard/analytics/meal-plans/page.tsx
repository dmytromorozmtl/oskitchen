import { AnalyticsFilterBar } from "@/components/dashboard/analytics-filter-bar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { parseAnalyticsFilters } from "@/lib/analytics/filters";
import { loadFilterableBrandsAndLocations } from "@/lib/analytics/server-helpers";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { formatCurrency } from "@/lib/utils";
import { loadMealPlanAnalytics } from "@/services/analytics/analytics-service";

export default async function MealPlanAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const sp = await searchParams;
  const filters = parseAnalyticsFilters(sp);
  const [{ brands, locations }, data] = await Promise.all([
    loadFilterableBrandsAndLocations(dataUserId),
    loadMealPlanAnalytics({ userId: dataUserId }, filters),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meal plan analytics</h1>
        <p className="text-muted-foreground">Active plans, recurring revenue, paused/cancelled plans, cycles in window.</p>
      </div>
      <AnalyticsFilterBar filters={filters} basePath="/dashboard/analytics/meal-plans" brands={brands} locations={locations} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total plans" value={data.totalPlans} />
        <Kpi label="Active plans" value={data.activePlans} />
        <Kpi label="Paused plans" value={data.pausedPlans} />
        <Kpi label="Cancelled plans" value={data.cancelledPlans} />
        <Kpi label="Recurring revenue (window)" value={formatCurrency(data.recurringRevenue)} />
        <Kpi label="Cycles starting in window" value={data.cyclesInWindow} />
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
