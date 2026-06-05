"use client";

import Link from "next/link";
import { Activity, AlertTriangle, Gauge } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { SlaMonitoringDashboard } from "@/lib/enterprise/sla-monitoring-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: SlaMonitoringDashboard;
};

const STATUS_CLASS: Record<
  SlaMonitoringDashboard["signals"][number]["status"],
  string
> = {
  healthy: "bg-emerald-600 hover:bg-emerald-600",
  degraded: "bg-amber-500 hover:bg-amber-500",
  down: "bg-red-600 hover:bg-red-600",
};

export function SlaMonitoringPanel({ dashboard }: Props) {
  const { summary, signals, alerts, targets, warnings } = dashboard;

  return (
    <div className="space-y-6" data-testid="sla-monitoring-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-semibold tracking-tight">
            <Gauge className="h-8 w-8 text-primary" aria-hidden />
            SLA monitoring
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Uptime, response time, and predictive alerts across platform health, LIVE integrations,
            cron execution, and webhook reliability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/integration-health/live">Integration health</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/dashboard/enterprise/audit">Audit &amp; compliance</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link href="/api/health">Health endpoint</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.uptimePct}%</p>
            <p className="text-xs text-muted-foreground">Target {targets.uptimePct}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">DB latency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.databaseLatencyMs}ms</p>
            <p className="text-xs text-muted-foreground">Target &lt;{targets.responseTimeMs}ms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fleet score</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.integrationFleetScore}</p>
            <p className="text-xs text-muted-foreground">
              {summary.healthyIntegrations} healthy · {summary.criticalIntegrations} critical
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{summary.alertCount}</p>
            <p className="text-xs text-muted-foreground">
              {summary.cronHealthy}/{summary.cronTotal} crons healthy
            </p>
          </CardContent>
        </Card>
      </div>

      {warnings.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Monitoring notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="sla-signals-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4" aria-hidden />
              SLA signals
            </CardTitle>
            <CardDescription>Four enterprise monitoring lanes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {signals.map((signal) => (
              <div
                key={signal.id}
                className="rounded-lg border border-border/80 bg-muted/30 p-3"
                data-testid={`sla-signal-${signal.id}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{signal.label}</p>
                  <Badge className={cn("capitalize", STATUS_CLASS[signal.status])}>
                    {signal.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{signal.detail}</p>
                {signal.uptimePct != null ? (
                  <p className="mt-1 text-xs tabular-nums">Uptime {signal.uptimePct}%</p>
                ) : null}
                {signal.responseTimeMs != null ? (
                  <p className="text-xs tabular-nums">Response {signal.responseTimeMs}ms</p>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card data-testid="sla-alerts-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Active alerts
            </CardTitle>
            <CardDescription>
              P95 target {targets.integrationP95Ms}ms · {summary.failedWebhooks} webhook failures
            </CardDescription>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All signals within SLA targets.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-lg border border-border/80 px-3 py-2"
                    data-testid={`sla-alert-${alert.id}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-sm">{alert.title}</p>
                      <Badge variant={alert.severity === "critical" ? "destructive" : "secondary"}>
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{alert.detail}</p>
                    {alert.href ? (
                      <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                        <Link href={alert.href}>Investigate</Link>
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Policy {dashboard.policyId} · Generated {new Date(dashboard.generatedAtIso).toLocaleString()}
      </p>
    </div>
  );
}
