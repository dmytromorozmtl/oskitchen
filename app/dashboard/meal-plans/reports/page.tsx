import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { formatCurrency } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { loadMealPlanOverviewKpis } from "@/services/meal-plans/meal-plan-service";

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

export default async function MealPlanReportsPage() {
  const { userId } = await getTenantActor();
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const [kpis, generatedLast30d, statusBreakdown, typeBreakdown] = await Promise.all([
    loadMealPlanOverviewKpis(userId),
    prisma.mealPlanCycle.count({
      where: { mealPlan: { userId }, status: "GENERATED", generatedAt: { gte: since } },
    }),
    prisma.mealPlan.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
    }),
    prisma.mealPlan.groupBy({
      by: ["type"],
      where: { userId },
      _count: { _all: true },
    }),
  ]);

  const totalPlans = statusBreakdown.reduce((acc, r) => acc + r._count._all, 0);
  const churn = statusBreakdown.find((r) => r.status === "CANCELLED")?._count._all ?? 0;
  const churnRate = totalPlans > 0 ? Math.round((churn / totalPlans) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Reports</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          Active subscriptions, recurring revenue estimate, churn share, cycle generation, and breakdowns.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Active plans" value={kpis.active} />
        <Kpi label="Paused" value={kpis.paused} />
        <Kpi label="Cycles generated (30d)" value={generatedLast30d} />
        <Kpi label="Cycles due (7d)" value={kpis.cyclesDueThisWeek} />
        <Kpi label="Meals due (7d)" value={kpis.mealsDueThisWeek} />
        <Kpi label="Delivery plans" value={kpis.deliveryPlans} />
        <Kpi label="Pickup plans" value={kpis.pickupPlans} />
        <Kpi label="Churn share" value={`${churnRate}%`} />
        <Kpi
          label="Est. recurring revenue / mo"
          value={formatCurrency(centsToDollars(kpis.estimatedRecurringRevenueCents))}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By status</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {statusBreakdown
              .sort((a, b) => b._count._all - a._count._all)
              .map((s) => (
                <li key={s.status} className="flex justify-between border-b border-border/40 py-1">
                  <span>{s.status}</span>
                  <strong>{s._count._all}</strong>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By plan type</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1 text-sm">
            {typeBreakdown
              .sort((a, b) => b._count._all - a._count._all)
              .map((t) => (
                <li key={t.type} className="flex justify-between border-b border-border/40 py-1">
                  <span>{t.type}</span>
                  <strong>{t._count._all}</strong>
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
