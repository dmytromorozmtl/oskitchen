import Link from "next/link";
import { Sparkles } from "lucide-react";

import { EmptyState } from "@/components/dashboard/empty-state";
import { PlanGate } from "@/components/plans/plan-gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FORECAST_SOURCE_LABEL,
  FORECAST_TYPE_LABEL,
  forecastTerminologyForMode,
} from "@/lib/forecast/forecast-types";
import { getTenantActor } from "@/lib/scope/cached-tenant";
import {
  menuListWhereForOwnerAnd,
  orderListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";
import { prisma } from "@/lib/prisma";
import { listForecastRuns } from "@/services/forecast/forecast-service";

export default async function ForecastOverviewPage() {
  const { sessionUser: user, dataUserId } = await getTenantActor();
  const profile = await prisma.userProfile.findUnique({
    where: { id: dataUserId },
    include: { kitchenSettings: { select: { businessType: true } } },
  });
  const businessMode = profile?.kitchenSettings?.businessType ?? null;
  const terminology = forecastTerminologyForMode(businessMode);

  const [orderWhere, activeMenuWhere] = await Promise.all([
    orderListWhereForOwner(dataUserId),
    menuListWhereForOwnerAnd(dataUserId, { active: true, catalogOnly: false }),
  ]);

  const [runs, orderCount, mealPlanCount, cateringCount, activeMenuCount] = await Promise.all([
    listForecastRuns(dataUserId),
    prisma.order.count({ where: orderWhere }),
    prisma.mealPlan.count({ where: { userId: dataUserId } }),
    prisma.cateringQuote.count({
      where: { userId: dataUserId, status: { in: ["ACCEPTED", "CONVERTED_TO_ORDER"] } },
    }),
    prisma.menu.count({ where: activeMenuWhere }),
  ]);

  const hasAnyData = orderCount + mealPlanCount + cateringCount + activeMenuCount > 0;

  return (
    <PlanGate userId={dataUserId} feature="forecasting" title={terminology.pageTitle}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{terminology.pageTitle}</h1>
            <p className="mt-2 max-w-3xl text-muted-foreground">{terminology.pageSubtitle}</p>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Estimate only.</span> All forecast numbers are deterministic
              projections from your own data and should not be treated as guarantees.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard/forecast/new">Run forecast</Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="rounded-full">
              <Link href="/dashboard/forecast/history">History</Link>
            </Button>
          </div>
        </div>

        {!hasAnyData ? (
          <EmptyState
            icon={Sparkles}
            title="Forecast needs operational data"
            description="Create orders, menus, meal plans, catering events, or manual plans so OS Kitchen can estimate upcoming demand."
            primaryLabel="Run manual forecast"
            primaryHref="/dashboard/forecast/new"
            secondaryLabel="Create menu"
            secondaryHref="/dashboard/menus"
            demoHref="/dashboard/orders"
          />
        ) : null}

        {businessMode === "MEAL_PREP" && activeMenuCount === 0 ? (
          <Card className="border-amber-300/60 bg-amber-50/40 shadow-none dark:bg-amber-950/20">
            <CardHeader>
              <CardTitle className="text-base">Set an active weekly menu</CardTitle>
              <CardDescription>
                Meal prep forecasts work best when an active weekly menu is available, but you can
                still use meal plans, historical orders, or manual planning.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi label="Orders captured" value={orderCount} />
          <Kpi label="Active meal plans" value={mealPlanCount} />
          <Kpi label="Accepted catering" value={cateringCount} />
          <Kpi label="Active menus" value={activeMenuCount} />
        </div>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent forecast runs</CardTitle>
            <CardDescription>Most recent first.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No forecast runs yet — run your first forecast from the wizard.
              </p>
            ) : null}
            {runs.map((r) => {
              const sources = Array.isArray(r.sourceTypesJson)
                ? (r.sourceTypesJson as string[])
                : [];
              return (
                <Link
                  key={r.id}
                  href={`/dashboard/forecast/${r.id}`}
                  className="block rounded-xl border border-border/70 p-3 hover:bg-muted/40"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{r.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {FORECAST_TYPE_LABEL[r.forecastType]} · {r.dateFrom.toISOString().slice(0, 10)} → {r.dateTo.toISOString().slice(0, 10)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <Badge variant="outline" className="rounded-full capitalize">
                        {r.confidence.toLowerCase()}
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {r._count.lines} lines
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {r._count.adjustments} adj.
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sources.map((s) => (
                      <Badge key={s} variant="secondary" className="rounded-full text-[10px]">
                        {FORECAST_SOURCE_LABEL[s as keyof typeof FORECAST_SOURCE_LABEL] ?? s}
                      </Badge>
                    ))}
                  </div>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );
}

function Kpi({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}
