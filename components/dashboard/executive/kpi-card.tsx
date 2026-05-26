import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExecutiveKpi } from "@/services/executive/executive-dashboard-service";

function deltaLabel(deltaPct: number | null): string | null {
  if (deltaPct == null) return null;
  if (deltaPct === 0) return "0%";
  const arrow = deltaPct > 0 ? "▲" : "▼";
  return `${arrow} ${(Math.abs(deltaPct) * 100).toFixed(1)}%`;
}

function deltaColor(deltaPct: number | null, invert = false): string {
  if (deltaPct == null || deltaPct === 0) return "text-muted-foreground";
  const positive = invert ? deltaPct < 0 : deltaPct > 0;
  return positive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400";
}

const INVERT_KEYS = new Set(["overdue_tasks", "inventory_alerts"]);

export function ExecutiveKpiCard({ kpi }: { kpi: ExecutiveKpi }) {
  const delta = kpi.comparison ? deltaLabel(kpi.comparison.deltaPct) : null;
  const colour = kpi.comparison
    ? deltaColor(kpi.comparison.deltaPct, INVERT_KEYS.has(kpi.key))
    : "text-muted-foreground";
  return (
    <Card className="border-border/80 shadow-sm">
      <CardHeader className="pb-1">
        <CardDescription>{kpi.label}</CardDescription>
        <CardTitle className="text-2xl font-semibold">{kpi.value}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 pt-0 text-xs">
        {delta && (
          <p className={colour}>
            {delta} vs. previous
          </p>
        )}
        {kpi.sub && <p className="text-muted-foreground">{kpi.sub}</p>}
        <Link
          href={kpi.drilldownRoute}
          className="text-primary underline-offset-4 hover:underline"
        >
          Drill down →
        </Link>
      </CardContent>
    </Card>
  );
}
