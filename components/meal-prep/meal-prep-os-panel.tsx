import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealPrepOsDashboard, MealPrepOsModuleStatus } from "@/lib/meal-prep/meal-prep-os-types";
import { cn } from "@/lib/utils";

const STATUS_VARIANT: Record<MealPrepOsModuleStatus, "default" | "secondary" | "destructive" | "outline"> = {
  healthy: "default",
  watch: "secondary",
  critical: "destructive",
  idle: "outline",
};

export function MealPrepOsPanel({ dashboard }: { dashboard: MealPrepOsDashboard }) {
  const { summary } = dashboard;

  return (
    <div className="space-y-8" data-testid="meal-prep-os-panel">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Meal Prep OS</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Weekly menus, preorder cutoffs, demand forecasting, and subscription cycles — one command
          center for meal prep operators.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Generated {dashboard.generatedAtIso.slice(0, 19).replace("T", " ")} UTC · policy{" "}
          {dashboard.policyId}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Active plans</CardTitle>
            <p className="text-2xl font-semibold">{summary.activePlans}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cycles this week</CardTitle>
            <p className="text-2xl font-semibold">{summary.cyclesDueThisWeek}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meals due</CardTitle>
            <p className="text-2xl font-semibold">{summary.mealsDueThisWeek}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Forecast committed</CardTitle>
            <p className="text-2xl font-semibold">{summary.forecastCommittedMeals}</p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {dashboard.modules.map((module) => (
          <Card key={module.module} className="border-border/80">
            <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
              <div>
                <CardTitle className="text-base">{module.label}</CardTitle>
                <CardDescription>{module.headline}</CardDescription>
              </div>
              <Badge variant={STATUS_VARIANT[module.status]} className="capitalize">
                {module.status}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1 text-sm">
                {module.metrics.map((metric) => (
                  <li key={metric.label} className="flex justify-between gap-2">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-medium">{metric.value}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground">{module.recommendation}</p>
              <Link
                href={module.href}
                className={cn(
                  "inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline",
                )}
              >
                Open module
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {dashboard.alerts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dashboard.alerts.map((alert) => (
              <p
                key={alert.id}
                className={cn(
                  "rounded-lg border px-3 py-2",
                  alert.severity === "warning"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-950 dark:text-amber-100"
                    : "border-border/70 bg-muted/30 text-muted-foreground",
                )}
              >
                {alert.message}
              </p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly menus</CardTitle>
            <CardDescription>{summary.weeklyMenuCount} active windows</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dashboard.weeklyMenus.length === 0 ? (
              <p className="text-muted-foreground">No weekly preorder menus yet.</p>
            ) : (
              dashboard.weeklyMenus.map((menu) => (
                <div
                  key={menu.menuId}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{menu.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {menu.startDateIso} → {menu.endDateIso} · cutoff {menu.preorderDeadlineIso}
                    </p>
                  </div>
                  <Badge variant={menu.published ? "default" : "outline"}>
                    {menu.published ? "Published" : "Draft"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming subscription cycles</CardTitle>
            <CardDescription>{dashboard.upcomingCycles.length} in horizon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {dashboard.upcomingCycles.length === 0 ? (
              <p className="text-muted-foreground">No upcoming cycles.</p>
            ) : (
              dashboard.upcomingCycles.map((cycle) => (
                <div
                  key={cycle.cycleId}
                  className="flex flex-wrap items-center justify-between gap-2 border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{cycle.planName}</p>
                    <p className="text-xs text-muted-foreground">
                      {cycle.customerName} · {cycle.cycleStartIso} · {cycle.status}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {cycle.selectionCount}/{cycle.mealsPlanned} meals
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        <Link href={dashboard.basePath} className="text-primary underline-offset-4 hover:underline">
          Meal prep hub
        </Link>
        {summary.storefrontCutoff ? ` · Storefront cutoff ${summary.storefrontCutoff}` : null}
      </p>
    </div>
  );
}
