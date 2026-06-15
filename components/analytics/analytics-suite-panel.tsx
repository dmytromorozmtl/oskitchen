"use client";

import Link from "next/link";
import { LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsSuiteSnapshot } from "@/lib/analytics/analytics-suite-types";

type Props = {
  snapshot: AnalyticsSuiteSnapshot;
};

export function AnalyticsSuitePanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="analytics-suite-panel">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Metric lanes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.laneCount}</p>
            <p className="text-xs text-muted-foreground">{snapshot.rangeLabel}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.metricCount}</p>
            <p className="text-xs text-muted-foreground">One screen — all analytics</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold tabular-nums">{snapshot.summary.warningCount}</p>
            <p className="text-xs text-muted-foreground">Data quality signals</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium tabular-nums">
              {new Date(snapshot.generatedAtIso).toLocaleString()}
            </p>
            <Badge variant="outline" className="mt-1 rounded-full text-xs">
              {snapshot.policyId}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {snapshot.warnings.length > 0 ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Warnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {snapshot.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        {snapshot.lanes.map((lane) => (
          <Card key={lane.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <LayoutDashboard className="h-4 w-4" />
                {lane.label}
              </CardTitle>
              <CardDescription>{lane.metrics.length} metrics</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {lane.metrics.map((metric) => (
                <div
                  key={metric.id}
                  className="rounded-lg border border-border/80 bg-muted/30 p-3"
                >
                  <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold tabular-nums">{metric.value}</p>
                  {metric.hint ? (
                    <p className="mt-1 text-xs text-muted-foreground">{metric.hint}</p>
                  ) : null}
                  {metric.href ? (
                    <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                      <Link href={metric.href}>Drill down</Link>
                    </Button>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
