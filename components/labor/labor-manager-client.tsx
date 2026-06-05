"use client";

import Link from "next/link";
import { AlertTriangle, CalendarRange, Clock, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_LABOR_MANAGER_ROUTE } from "@/lib/ai/labor-manager-policy";
import type { LaborManagerSnapshot } from "@/lib/ai/labor-manager-types";
import { cn } from "@/lib/utils";

const SEVERITY_VARIANT: Record<
  LaborManagerSnapshot["overtimeAlerts"][number]["severity"],
  "destructive" | "default" | "secondary" | "outline"
> = {
  critical: "destructive",
  high: "default",
  normal: "secondary",
  low: "outline",
};

const STATUS_LABEL: Record<LaborManagerSnapshot["summary"]["laborStatus"], string> = {
  OVER: "Over target",
  ON_TRACK: "On track",
  UNDER: "Under target",
};

type Props = {
  snapshot: LaborManagerSnapshot;
};

export function LaborManagerClient({ snapshot }: Props) {
  const staffingGaps = snapshot.staffingSignals.filter((row) => row.type !== "on_target");

  return (
    <div className="space-y-6" data-testid="ai-labor-manager-root">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Labor Manager</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Staffing optimization from demand-based scheduling and overtime alerts from live clock data.
          Confidence {Math.round(snapshot.summary.confidence * 100)}%.
        </p>
      </div>

      <Card data-testid="ai-labor-manager-daily-brief">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Daily labor brief</CardTitle>
          <CardDescription>{snapshot.dailyBrief.executiveSummary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-lg font-medium">{snapshot.dailyBrief.headline}</p>
          {snapshot.dailyBrief.bullets.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {snapshot.dailyBrief.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-muted-foreground" aria-hidden />
              Labor today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">
              {snapshot.summary.laborPercent.toFixed(1)}%
            </p>
            <p className="text-sm text-muted-foreground">
              {STATUS_LABEL[snapshot.summary.laborStatus]} · {snapshot.summary.activeStaff} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarRange className="h-4 w-4 text-amber-600" aria-hidden />
              Staffing gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{snapshot.summary.understaffedDays}</p>
            <p className="text-sm text-muted-foreground">
              understaffed · {snapshot.summary.overstaffedDays} overstaffed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="h-4 w-4 text-red-600" aria-hidden />
              Overtime risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{snapshot.overtimeAlerts.length}</p>
            <p className="text-sm text-muted-foreground">
              ${snapshot.summary.projectedOvertimeCost.toFixed(0)} est. OT cost
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" aria-hidden />
            Staffing optimization
          </CardTitle>
          <CardDescription>
            Week of {snapshot.weekStartIso} — compare scheduled shifts vs AI-recommended headcount.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {staffingGaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staffing gaps detected for this week.</p>
          ) : (
            <ul className="space-y-3">
              {staffingGaps.slice(0, 8).map((signal) => (
                <li
                  key={`${signal.dateIso}-${signal.type}`}
                  className="flex flex-wrap items-start justify-between gap-2 rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium">
                      {signal.dayLabel} · {signal.type === "understaffed" ? "Understaffed" : "Overstaffed"}
                    </p>
                    <p className="text-sm text-muted-foreground">{signal.recommendation}</p>
                    <p className="text-xs text-muted-foreground">
                      {signal.scheduledHeadcount} scheduled / {signal.recommendedHeadcount} recommended ·{" "}
                      {signal.predictedOrders} orders
                    </p>
                  </div>
                  <Badge variant={SEVERITY_VARIANT[signal.severity]}>{signal.severity}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overtime alerts</CardTitle>
          <CardDescription>Projected weekly hours from scheduled shifts and today&apos;s clock data.</CardDescription>
        </CardHeader>
        <CardContent>
          {snapshot.overtimeAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No staff projected at overtime threshold.</p>
          ) : (
            <ul className="space-y-3">
              {snapshot.overtimeAlerts.map((alert) => (
                <li
                  key={alert.staffMemberId}
                  className={cn(
                    "flex flex-wrap items-start justify-between gap-2 rounded-md border p-3",
                    alert.severity === "critical" && "border-destructive/40",
                  )}
                >
                  <div className="space-y-1">
                    <p className="font-medium">{alert.staffName}</p>
                    <p className="text-sm text-muted-foreground">{alert.recommendation}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.projectedWeekHours}h projected · {alert.overtimeHours}h OT · $
                      {alert.estimatedOvertimeCost.toFixed(0)} est.
                    </p>
                  </div>
                  <Badge variant={SEVERITY_VARIANT[alert.severity]}>{alert.severity}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link href="/dashboard/staff/ai-scheduling" className="underline">
          AI scheduling
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/staff/schedule" className="underline">
          Labor schedule
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link href="/dashboard/reports/labor" className="underline">
          Labor reports
        </Link>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">{AI_LABOR_MANAGER_ROUTE}</span>
      </div>
    </div>
  );
}
