"use client";

import Link from "next/link";
import { ArrowRight, ClipboardList, LayoutDashboard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ManagerRoleUiSnapshot } from "@/lib/roles/manager-ui-types";
import { cn } from "@/lib/utils";

type Props = {
  snapshot: ManagerRoleUiSnapshot;
};

function tileToneClass(tone: "neutral" | "attention" | "success"): string {
  if (tone === "attention") {
    return "border-amber-200/70 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15";
  }
  if (tone === "success") {
    return "border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30 dark:bg-emerald-950/10";
  }
  return "border-border/70 bg-background/80";
}

export function ManagerRolePanel({ snapshot }: Props) {
  return (
    <div className="space-y-6" data-testid="manager-role-panel">
      <Card className="border-blue-500/20 bg-blue-500/[0.03]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            {snapshot.rolePackLabel}
          </CardTitle>
          <CardDescription>{snapshot.rolePackHeadline}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full">
            {snapshot.workspaceLabel}
          </Badge>
          <Badge variant="outline" className="rounded-full">
            {snapshot.summary.readinessOverall}% readiness
          </Badge>
          {snapshot.summary.attentionTileCount > 0 ? (
            <Badge variant="secondary" className="rounded-full">
              {snapshot.summary.attentionTileCount} attention tiles
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {snapshot.kpis.map((kpi) => (
          <Card key={kpi.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold tabular-nums">{kpi.value}</p>
              {kpi.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
              ) : null}
              {kpi.href ? (
                <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                  <Link href={kpi.href}>Drill down</Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card
        className={cn(
          "border shadow-sm",
          snapshot.nextAction.tone === "urgent"
            ? "border-amber-200/80 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20"
            : "border-blue-500/25 bg-blue-500/[0.04]",
        )}
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Next action</CardTitle>
          <CardDescription>{snapshot.nextAction.detail}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium">{snapshot.nextAction.title}</p>
          <Button asChild size="sm" className="rounded-full">
            <Link href={snapshot.nextAction.href}>
              {snapshot.nextAction.ctaLabel}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Priority tiles</CardTitle>
            <CardDescription>Manager-pack signals from today&apos;s briefing</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {snapshot.heroTiles.map((tile) => (
              <div
                key={tile.id}
                className={cn("rounded-lg border p-3", tileToneClass(tile.tone))}
              >
                <p className="text-xs font-medium text-muted-foreground">{tile.label}</p>
                <p className="mt-1 text-lg font-semibold tabular-nums">{tile.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{tile.detail}</p>
                <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">
                  <Link href={tile.href}>Open</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top actions</CardTitle>
            <CardDescription>Ranked shift priorities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {snapshot.topActions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-start justify-between gap-3 rounded-lg border border-border/80 p-3"
              >
                <div>
                  <p className="text-xs text-muted-foreground">#{index + 1}</p>
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.reason}</p>
                </div>
                <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full">
                  <Link href={action.href}>{action.ctaLabel}</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LayoutDashboard className="h-4 w-4" />
            Manager shortcuts
          </CardTitle>
          <CardDescription>{snapshot.summary.shortcutCount} shift operations surfaces</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {snapshot.shortcuts.map((shortcut) => (
            <Link
              key={shortcut.id}
              href={shortcut.href}
              className="rounded-lg border border-border/80 bg-muted/20 p-3 transition-colors hover:bg-muted/40"
            >
              <p className="text-sm font-medium">{shortcut.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{shortcut.description}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
