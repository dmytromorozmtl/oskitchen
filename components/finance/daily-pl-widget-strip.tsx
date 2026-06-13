import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus, Target, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDailyPlDeltaPct } from "@/lib/finance/daily-pl-widget-p2-47-measurement";
import { formatCurrency } from "@/lib/utils";
import type { DailyPlWidgetPayload } from "@/services/finance/daily-pl-widget-p2-47-service";

export function DailyPlWidgetStrip({ data }: { data: DailyPlWidgetPayload }) {
  const { comparison, currency } = data;
  const PaceIcon =
    comparison.paceLabel === "ahead"
      ? ArrowUpRight
      : comparison.paceLabel === "behind"
        ? ArrowDownRight
        : comparison.paceLabel === "on_track"
          ? Minus
          : TrendingUp;

  return (
    <Card className="border-border/80 shadow-sm" data-testid="daily-pl-widget-p2-47">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              Daily P&L snapshot
            </CardTitle>
            <CardDescription>
              R365 parity — revenue today vs yesterday vs target. Directional BETA — not audited
              financial reporting.
            </CardDescription>
          </div>
          <Badge variant="outline" className="rounded-full text-xs capitalize">
            {comparison.paceLabel.replace(/_/g, " ")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Metric
            testId="daily-pl-revenue-today"
            label="Revenue today"
            value={formatCurrency(comparison.revenueToday, currency)}
            hint={
              comparison.vsYesterdayPct != null
                ? `${formatDailyPlDeltaPct(comparison.vsYesterdayPct)} vs yesterday`
                : undefined
            }
          />
          <Metric
            testId="daily-pl-revenue-yesterday"
            label="Revenue yesterday"
            value={formatCurrency(comparison.revenueYesterday, currency)}
          />
          <Metric
            testId="daily-pl-revenue-target"
            label="Daily target"
            value={formatCurrency(comparison.revenueTarget, currency)}
            hint={
              comparison.revenueTarget > 0
                ? comparison.targetSource === "configured"
                  ? "Configured target"
                  : "7-day average target"
                : "Set target in finance settings"
            }
            icon={Target}
          />
        </div>

        {comparison.revenueTarget > 0 && comparison.vsTargetPct != null ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <PaceIcon className="h-4 w-4" aria-hidden />
            <span>
              {comparison.vsTargetPct}% of daily target ·{" "}
              {formatCurrency(
                Math.max(0, comparison.revenueTarget - comparison.revenueToday),
                currency,
              )}{" "}
              remaining
            </span>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href={data.analyticsHref} className="font-medium text-primary hover:underline">
            Analytics →
          </Link>
          <Link href={data.pnlHref} className="font-medium text-primary hover:underline">
            Restaurant P&L →
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
  icon?: typeof Target;
}) {
  return (
    <div
      className="rounded-xl border border-border/70 bg-muted/20 p-4"
      data-testid={testId}
    >
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
