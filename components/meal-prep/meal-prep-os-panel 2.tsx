"use client";

import Link from "next/link";
import { CalendarClock, Clock, LineChart, Salad, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MealPrepOsDashboard } from "@/lib/meal-prep/meal-prep-os-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: MealPrepOsDashboard;
};

const MODULE_ICONS: Record<MealPrepOsDashboard["modules"][number]["module"], typeof Salad> = {
  weekly_menu: Salad,
  cutoffs: Clock,
  forecasting: LineChart,
  subscriptions: Users,
};

const STATUS_VARIANT: Record<
  MealPrepOsDashboard["modules"][number]["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  watch: "secondary",
  critical: "destructive",
  idle: "outline",
};

export function MealPrepOsPanel({ dashboard }: Props) {
  const { modules, summary, alerts, weeklyMenus, upcomingCycles, basePath } = dashboard;

  return (
    <div className="space-y-6" data-testid="meal-prep-os-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <CalendarClock className="h-8 w-8 text-primary" aria-hidden />
            Meal Prep OS
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Weekly menus, preorder cutoffs, demand forecasting, and subscription cycles on one screen.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/meal-plans/new">New meal plan</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/menus">Weekly menus</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/catering">Catering OS</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Recurring MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.recurringRevenue)}</p>
            <p className="text-xs text-muted-foreground">{summary.activePlans} active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">This week</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.mealsDueThisWeek}</p>
            <p className="text-xs text-muted-foreground">{summary.cyclesDueThisWeek} cycles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly menus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.weeklyMenuCount}</p>
            <p className="text-xs text-muted-foreground">{summary.cutoffMenusSoon} deadlines soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.forecastCommittedMeals}</p>
            <p className="text-xs text-muted-foreground">committed meals (14d)</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {modules.map((mod) => {
          const Icon = MODULE_ICONS[mod.module];
          return (
            <Card key={mod.module} className={cn(mod.status === "critical" && "border-destructive/40")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {mod.label}
                  </CardTitle>
                  <Badge variant={STATUS_VARIANT[mod.status]}>{mod.status}</Badge>
                </div>
                <CardDescription>{mod.headline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  {mod.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                      <dd className="font-semibold tabular-nums">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-muted-foreground">{mod.recommendation}</p>
                <Link href={mod.href} className="text-xs text-primary hover:underline">
                  Open {mod.label.toLowerCase()} →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alerts.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Meal prep alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm",
                    alert.severity === "warning" && "border-amber-300/60 bg-amber-50/40 dark:bg-amber-950/20",
                  )}
                >
                  {alert.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly menus</CardTitle>
            <CardDescription>WEEKLY_PREORDER menus with preorder deadlines.</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyMenus.length === 0 ? (
              <p className="text-sm text-muted-foreground">No weekly menus — create one under Menus.</p>
            ) : (
              <ul className="space-y-2">
                {weeklyMenus.map((menu) => (
                  <li key={menu.menuId} className="rounded-md border px-3 py-2 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{menu.title}</p>
                      <Badge variant={menu.published ? "default" : "outline"}>
                        {menu.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {menu.startDateIso} → {menu.endDateIso} · cutoff {menu.preorderDeadlineIso} ·{" "}
                      {menu.productCount} items
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming cycles</CardTitle>
            <CardDescription>Subscription cycles in the next 14 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingCycles.length === 0 ? (
              <p className="text-sm text-muted-foreground">No upcoming cycles — add meal plans or wait for renewals.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingCycles.map((cycle) => (
                  <li key={cycle.cycleId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{cycle.planName}</p>
                      <p className="text-xs text-muted-foreground">
                        {cycle.cycleStartIso} · {cycle.customerName} · {cycle.mealsPlanned} meals
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {cycle.status.toLowerCase().replace(/_/g, " ")}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Cutoff {summary.storefrontCutoff ?? "not set"} · {summary.draftsNeeded} selections due · {basePath}
      </p>
    </div>
  );
}
