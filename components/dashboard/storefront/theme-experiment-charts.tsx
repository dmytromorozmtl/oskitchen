"use client";

import * as React from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ExperimentDailyChartRow } from "@/lib/storefront/theme-experiment-analytics-core";
import { cn } from "@/lib/utils";

type ChartRow = {
  label: string;
  pubExposures: number;
  draftExposures: number;
  pubCheckouts: number;
  draftCheckouts: number;
  pubSubmits: number;
  draftSubmits: number;
  pubRate: number;
  draftRate: number;
};

function toChartRows(data: ExperimentDailyChartRow[]): ChartRow[] {
  return data.map((d) => ({
    label: d.label,
    pubExposures: d.published.exposures,
    draftExposures: d.draft.exposures,
    pubCheckouts: d.published.checkouts,
    draftCheckouts: d.draft.checkouts,
    pubSubmits: d.published.conversions,
    draftSubmits: d.draft.conversions,
    pubRate: d.published.conversionRatePercent,
    draftRate: d.draft.conversionRatePercent,
  }));
}

function hasAnyActivity(rows: ChartRow[]): boolean {
  return rows.some(
    (r) =>
      r.pubExposures +
        r.draftExposures +
        r.pubCheckouts +
        r.draftCheckouts +
        r.pubSubmits +
        r.draftSubmits >
      0,
  );
}

export function ThemeExperimentCharts({ data, days }: { data: ExperimentDailyChartRow[]; days: number }) {
  const [armFilter, setArmFilter] = React.useState<"both" | "published" | "draft">("both");
  const chartData = React.useMemo(() => toChartRows(data), [data]);

  if (!hasAnyActivity(chartData)) {
    return (
      <p className="text-sm text-muted-foreground">
        No experiment events yet. Exposure and checkout events appear after guests receive a{" "}
        <code className="rounded bg-muted px-1 text-xs">kos_ab_theme</code> assignment.
      </p>
    );
  }

  const filteredBars: string[] | null =
    armFilter === "published"
      ? ["pubExposures", "pubCheckouts", "pubSubmits"]
      : armFilter === "draft"
        ? ["draftExposures", "draftCheckouts", "draftSubmits"]
        : null;

  const showBar = (key: string) => !filteredBars || filteredBars.includes(key);

  const showPub = armFilter !== "draft";
  const showDraft = armFilter !== "published";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Arm filter</span>
        {(["both", "published", "draft"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setArmFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              armFilter === key
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border/80 text-muted-foreground hover:bg-muted/50",
            )}
          >
            {key === "both" ? "Both arms" : `${key} only`}
          </button>
        ))}
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Daily funnel volume ({days}d, UTC)</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Bars — exposures, checkouts started, submissions. Compare traffic split between arms.
        </p>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                labelFormatter={(label) => `Date (UTC): ${label}`}
                formatter={(value: number, name: string) => [value, name]}
              />
              <Legend />
              {showPub && showBar("pubExposures") ? (
                <Bar
                  yAxisId="left"
                  dataKey="pubExposures"
                  name="Published — exposures"
                  fill="hsl(var(--muted-foreground))"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
              {showDraft && showBar("draftExposures") ? (
                <Bar
                  yAxisId="left"
                  dataKey="draftExposures"
                  name="Draft — exposures"
                  fill="hsl(262 60% 65%)"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
              {showPub && showBar("pubCheckouts") ? (
                <Bar
                  yAxisId="left"
                  dataKey="pubCheckouts"
                  name="Published — checkouts"
                  fill="hsl(var(--primary))"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
              {showDraft && showBar("draftCheckouts") ? (
                <Bar
                  yAxisId="left"
                  dataKey="draftCheckouts"
                  name="Draft — checkouts"
                  fill="hsl(262 83% 58%)"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
              {showPub && showBar("pubSubmits") ? (
                <Bar
                  yAxisId="left"
                  dataKey="pubSubmits"
                  name="Published — submits"
                  fill="hsl(142 76% 36%)"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
              {showDraft && showBar("draftSubmits") ? (
                <Bar
                  yAxisId="left"
                  dataKey="draftSubmits"
                  name="Draft — submits"
                  fill="hsl(142 50% 45%)"
                  radius={[3, 3, 0, 0]}
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Checkout → submit rate ({days}d)</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Rolling daily conversion among guests who started checkout, by arm.
        </p>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}%`, name]}
                labelFormatter={(label) => `Date (UTC): ${label}`}
              />
              <Legend />
              {showPub ? (
                <Line
                  type="monotone"
                  dataKey="pubRate"
                  name="Published — conversion %"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              ) : null}
              {showDraft ? (
                <Line
                  type="monotone"
                  dataKey="draftRate"
                  name="Draft — conversion %"
                  stroke="hsl(262 83% 58%)"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  connectNulls
                />
              ) : null}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
