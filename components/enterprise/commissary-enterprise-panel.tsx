"use client";

import Link from "next/link";
import { Factory, Package, Truck, Warehouse } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommissaryPillarSnapshot, EnterpriseCommissaryDashboard } from "@/lib/enterprise/commissary-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: EnterpriseCommissaryDashboard;
};

const PILLAR_ICONS: Record<CommissaryPillarSnapshot["pillar"], typeof Factory> = {
  production: Factory,
  purchasing: Package,
  delivery: Truck,
  distribution: Warehouse,
};

const STATUS_VARIANT: Record<
  CommissaryPillarSnapshot["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  watch: "secondary",
  critical: "destructive",
  idle: "outline",
};

export function CommissaryEnterprisePanel({ dashboard }: Props) {
  const { pillars, summary, alerts, recentTransfers, upcomingProduction, basePath, weekStartIso } = dashboard;

  return (
    <div className="space-y-6" data-testid="enterprise-commissary-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Warehouse className="h-8 w-8 text-primary" aria-hidden />
            Commissary OS
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Production, purchasing, delivery, and distribution on one screen — hub fulfillment for multi-location
            operators. Week of {weekStartIso}.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/commissary/transfers">Transfers</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/multi-brand">Multi-brand</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/production/calendar">Production calendar</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {pillars.map((pillar) => {
          const Icon = PILLAR_ICONS[pillar.pillar];
          return (
            <Card key={pillar.pillar} className={cn(pillar.status === "critical" && "border-destructive/40")}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {pillar.label}
                  </CardTitle>
                  <Badge variant={STATUS_VARIANT[pillar.status]}>{pillar.status}</Badge>
                </div>
                <CardDescription>{pillar.headline}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <dl className="grid grid-cols-3 gap-2 text-sm">
                  {pillar.metrics.map((metric) => (
                    <div key={metric.label}>
                      <dt className="text-xs text-muted-foreground">{metric.label}</dt>
                      <dd className="font-semibold tabular-nums">{metric.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs text-muted-foreground">{pillar.recommendation}</p>
                <Link href={pillar.href} className="text-xs text-primary hover:underline">
                  Open {pillar.label.toLowerCase()} →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {alerts.length > 0 ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Commissary alerts</CardTitle>
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
            <CardTitle className="text-base">Upcoming production</CardTitle>
            <CardDescription>Batch tasks scheduled this week at the commissary hub.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingProduction.length === 0 ? (
              <p className="text-sm text-muted-foreground">No open production tasks — add batches on the calendar.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingProduction.map((task) => (
                  <li key={task.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {task.planDateIso}
                        {task.batchSize != null ? ` · batch ${task.batchSize}` : ""}
                      </p>
                    </div>
                    <Badge variant="outline">{task.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribution transfers</CardTitle>
            <CardDescription>Hub → store ingredient moves · {summary.pendingTransfers} pending.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTransfers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No transfers yet — create hub replenishment orders.</p>
            ) : (
              <ul className="space-y-2">
                {recentTransfers.map((transfer) => (
                  <li key={transfer.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{transfer.status}</p>
                      <p className="text-xs text-muted-foreground">
                        {transfer.lineCount} line{transfer.lineCount === 1 ? "" : "s"} · {transfer.createdAtIso.slice(0, 10)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        {summary.locationCount} locations · {summary.openPurchaseOrders} open POs · {summary.routesPlannedToday} routes
        today · {basePath}
      </p>
    </div>
  );
}
