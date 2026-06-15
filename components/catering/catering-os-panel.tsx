"use client";

import Link from "next/link";
import { CalendarDays, Package, Route, Users, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CateringOsDashboard } from "@/lib/catering/catering-os-types";
import { cn, formatCurrency } from "@/lib/utils";

type Props = {
  dashboard: CateringOsDashboard;
};

const MODULE_ICONS: Record<CateringOsDashboard["modules"][number]["module"], typeof CalendarDays> = {
  events: CalendarDays,
  clients: Users,
  packing: Package,
  routes: Route,
};

const STATUS_VARIANT: Record<
  CateringOsDashboard["modules"][number]["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  healthy: "default",
  watch: "secondary",
  critical: "destructive",
  idle: "outline",
};

export function CateringOsPanel({ dashboard }: Props) {
  const { modules, summary, alerts, upcomingEvents, topClients, basePath } = dashboard;

  return (
    <div className="space-y-6" data-testid="catering-os-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <UtensilsCrossed className="h-8 w-8 text-primary" aria-hidden />
            Catering OS
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Events, clients, packing, and routes on one screen — from quote pipeline through production
            handoff.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild className="rounded-full">
            <Link href="/dashboard/catering-quotes/new">New quote</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/catering-quotes">Quote center</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/meal-prep">Meal Prep OS</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/commissary">Commissary OS</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{formatCurrency(summary.pipelineValue)}</p>
            <p className="text-xs text-muted-foreground">{summary.openQuotes} open quotes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.upcomingEvents}</p>
            <p className="text-xs text-muted-foreground">{summary.deliveryEvents} delivery</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.activeClients}</p>
            <p className="text-xs text-muted-foreground">{summary.acceptedQuotes} accepted</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ops today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.packingTasksToday}</p>
            <p className="text-xs text-muted-foreground">{summary.routesPlannedToday} routes</p>
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
            <CardTitle className="text-base">Catering alerts</CardTitle>
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
            <CardTitle className="text-base">Upcoming events</CardTitle>
            <CardDescription>Quotes with event dates in the next 30 days.</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events scheduled — add dates to open quotes.</p>
            ) : (
              <ul className="space-y-2">
                {upcomingEvents.map((event) => (
                  <li key={event.quoteId} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium">{event.eventName}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.eventDateIso} · {event.customerName}
                        {event.guestCount != null ? ` · ${event.guestCount} guests` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="capitalize">
                        {event.status.toLowerCase()}
                      </Badge>
                      <p className="mt-1 text-xs tabular-nums">{formatCurrency(event.total)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top clients</CardTitle>
            <CardDescription>B2B accounts ranked by open pipeline value.</CardDescription>
          </CardHeader>
          <CardContent>
            {topClients.length === 0 ? (
              <p className="text-sm text-muted-foreground">No clients yet — create catering quotes with company names.</p>
            ) : (
              <ul className="space-y-2">
                {topClients.map((client) => (
                  <li key={client.key} className="rounded-md border px-3 py-2 text-sm">
                    <p className="font-medium">{client.displayName}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.quoteCount} quote{client.quoteCount === 1 ? "" : "s"} · {formatCurrency(client.pipelineValue)}
                      {client.lastEventDateIso ? ` · next ${client.lastEventDateIso}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">{basePath}</p>
    </div>
  );
}
