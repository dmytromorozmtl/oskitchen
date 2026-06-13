import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus, TrendingUp, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatLaborCostDeltaPct } from "@/lib/staff/labor-cost-widget-p2-49-measurement";
import { formatCurrency } from "@/lib/utils";
import type { LaborCostWidgetPayload } from "@/services/staff/labor-cost-widget-p2-49-service";

export function LaborCostWidgetStrip({ data }: { data: LaborCostWidgetPayload }) {
  const { comparison } = data;
  const StatusIcon =
    comparison.status === "OVER"
      ? ArrowUpRight
      : comparison.status === "UNDER"
        ? ArrowDownRight
        : Minus;

  const statusLabel =
    comparison.status === "OVER"
      ? "Over target"
      : comparison.status === "UNDER"
        ? "Under target"
        : "On track";

  return (
    <Card className="border-border/80 shadow-sm" data-testid="labor-cost-widget-p2-49">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              Labor cost snapshot
            </CardTitle>
            <CardDescription>
              7shifts parity — real-time labor % vs revenue today. Directional BETA — not audited
              payroll reporting.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full text-xs capitalize">
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric
            testId="labor-cost-percent"
            label="Labor %"
            value={`${comparison.laborPercent}%`}
            hint={formatLaborCostDeltaPct(comparison.laborPercent, comparison.targetLaborPercent)}
          />
          <Metric
            testId="labor-cost-revenue"
            label="Labor cost / revenue"
            value={`${formatCurrency(comparison.laborCost, data.currency)} / ${formatCurrency(comparison.totalRevenue, data.currency)}`}
            hint={`${comparison.totalLaborHours}h · ${comparison.activeStaff} active`}
            icon={Users}
          />
          <Metric
            testId="labor-cost-target"
            label="Target labor %"
            value={`${comparison.targetLaborPercent}%`}
            hint={
              comparison.targetSource === "configured"
                ? "Configured target"
                : "Default 30% target"
            }
          />
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              comparison.laborPercent > comparison.targetLaborPercent ? "bg-rose-500" : "bg-emerald-500"
            }`}
            style={{
              width: `${Math.min(
                (comparison.laborPercent / Math.max(comparison.targetLaborPercent, 1)) * 100,
                100,
              )}%`,
            }}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <StatusIcon className="h-4 w-4" aria-hidden />
          <span>Updated {new Date(data.updatedAtIso).toLocaleTimeString()}</span>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={data.laborHref} className="font-medium text-primary hover:underline">
            Labor tracker →
          </Link>
          <Link href={data.staffHref} className="font-medium text-primary hover:underline">
            Staff hub →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  testId,
  label,
  value,
  hint,
  icon: Icon,
}: {
  testId: string;
  label: string;
  value: string;
  hint?: string;
  icon?: typeof Users;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-muted/20 p-4" data-testid={testId}>
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
