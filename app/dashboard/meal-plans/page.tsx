import Link from "next/link";

import { backfillLegacyFormAction } from "@/actions/meal-plans";
import { EmptyState } from "@/components/dashboard/empty-state";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import { mealPlanTerminologyForMode } from "@/lib/meal-plans/meal-plan-types";
import {
  MEAL_PLAN_STATUS_BADGE,
  MEAL_PLAN_STATUS_LABEL,
} from "@/lib/meal-plans/meal-plan-status";
import { centsToDollars } from "@/lib/crm/customer-metrics";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  listMealPlansForUser,
  loadMealPlanOverviewKpis,
  backfillLegacySubscriptions,
} from "@/services/meal-plans/meal-plan-service";
import { CalendarClock } from "lucide-react";

function Kpi({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}

export default async function MealPlansOverviewPage() {
  const { userId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: userId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const terminology = mealPlanTerminologyForMode(profile?.kitchenSettings?.businessType ?? null);

  const planCount = await prisma.mealPlan.count({ where: { userId } });
  if (planCount === 0) {
    // Mirror any legacy CustomerSubscription rows once so the new center reflects them.
    await backfillLegacySubscriptions(userId).catch(() => undefined);
  }

  const [plans, kpis] = await Promise.all([
    listMealPlansForUser({ userId }, { take: 25 }),
    loadMealPlanOverviewKpis(userId),
  ]);

  if (plans.length === 0) {
    return (
      <PlanGate userId={userId} feature="customer_crm" title={terminology.pageTitle}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{terminology.pageSubtitle}</p>
          </div>
          <EmptyState
            icon={CalendarClock}
            title="No meal subscriptions yet"
            description="Create recurring meal plans for weekly customers, family bundles, corporate lunch rotations, or pickup/delivery subscriptions."
            primaryLabel={terminology.newCtaLabel}
            primaryHref="/dashboard/meal-plans/new"
            secondaryLabel="Use template"
            secondaryHref="/dashboard/meal-plans/templates"
            demoHref="/dashboard/customers"
          />
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate userId={userId} feature="customer_crm" title={terminology.pageTitle}>
      <div className="space-y-8">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{terminology.pageSubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/dashboard/meal-plans/new">{terminology.newCtaLabel}</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/dashboard/meal-plans/cycles">Upcoming cycles</Link>
            </Button>
            <form action={backfillLegacyFormAction}>
              <Button type="submit" variant="ghost" size="sm">
                Sync legacy subscriptions
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Active plans" value={kpis.active} />
          <Kpi label="Paused" value={kpis.paused} />
          <Kpi label="Needs review" value={kpis.needsReview} />
          <Kpi label="Cycles due (7d)" value={kpis.cyclesDueThisWeek} />
          <Kpi label="Drafts needed" value={kpis.draftsNeeded} />
          <Kpi label="Meals due (7d)" value={kpis.mealsDueThisWeek} />
          <Kpi label="Delivery plans" value={kpis.deliveryPlans} />
          <Kpi label="Pickup plans" value={kpis.pickupPlans} />
          <Kpi
            label="Est. recurring revenue / mo"
            value={formatCurrency(centsToDollars(kpis.estimatedRecurringRevenueCents))}
            hint="From plans with priced cycles"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Plans</CardTitle>
            <CardDescription>
              Sorted by status, then next order date. Click a row to open the plan detail page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-muted-foreground">
                  <tr className="border-b border-border/70">
                    <th className="py-2 pr-2">Plan</th>
                    <th className="py-2 pr-2">Customer</th>
                    <th className="py-2 pr-2">Status</th>
                    <th className="py-2 pr-2">Frequency</th>
                    <th className="py-2 pr-2 text-right">Meals/cycle</th>
                    <th className="py-2 pr-2">Fulfillment</th>
                    <th className="py-2 pr-2">Next order</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((p) => (
                    <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30">
                      <td className="py-2 pr-2">
                        <Link href={`/dashboard/meal-plans/${p.id}`} className="font-medium hover:underline">
                          {p.name}
                        </Link>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">
                        {p.customer.displayName ?? p.customer.name ?? p.customer.email}
                      </td>
                      <td className="py-2 pr-2">
                        <Badge variant={MEAL_PLAN_STATUS_BADGE[p.status]} className="rounded-full">
                          {MEAL_PLAN_STATUS_LABEL[p.status]}
                        </Badge>
                      </td>
                      <td className="py-2 pr-2 text-muted-foreground">{p.frequency}</td>
                      <td className="py-2 pr-2 text-right tabular-nums">{p.mealsPerCycle}</td>
                      <td className="py-2 pr-2 text-muted-foreground">{p.fulfillmentMode}</td>
                      <td className="py-2 pr-2 text-muted-foreground">
                        {p.nextOrderDate ? p.nextOrderDate.toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}
