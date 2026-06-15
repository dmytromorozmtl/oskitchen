"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useTransition } from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Minus,
  Network,
  Shield,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { contributeBenchmarkDataAction } from "@/actions/benchmark-analytics";
import { AiHonestyBanner } from "@/components/ui/ai-honesty-label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  GAUGE_TONE_BADGE,
  GAUGE_TONE_BG,
  GAUGE_TONE_CLASS,
  formatBenchmarkValue,
} from "@/lib/ai/benchmark-dashboard-builders";
import type { BenchmarkDashboardPayload } from "@/lib/ai/benchmark-dashboard-types";
import type { BenchmarkMetric } from "@/lib/ai/benchmark-network-types";
import { gaugeToneForPercentile } from "@/lib/ai/benchmark-network-builders";
import { benchmarkRadarColors } from "@/lib/design/color-tokens";
import { cn } from "@/lib/utils";

type Props = BenchmarkDashboardPayload;

function TrendIcon({ trend }: { trend: BenchmarkMetric["trend"] }) {
  if (trend === "up") return <ArrowUp className="h-3.5 w-3.5 text-emerald-600" aria-hidden />;
  if (trend === "down") return <ArrowDown className="h-3.5 w-3.5 text-red-600" aria-hidden />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />;
}

function PercentileGauge({ rank }: { rank: number }) {
  const tone = gaugeToneForPercentile(rank);
  const pct = Math.min(100, rank);

  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r="52" fill="none" className="stroke-muted" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          className={GAUGE_TONE_BG[tone]}
          strokeWidth="10"
          strokeDasharray={`${(pct / 100) * 327} 327`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-sm font-semibold", GAUGE_TONE_CLASS[tone])}>{rank.toFixed(0)}</span>
      </div>
    </div>
  );
}

/** METRIC_CARD_EXCEPTION — percentile gauge benchmark cards, not label/value KPI strips. */
function MetricCard({ metric }: { metric: BenchmarkMetric }) {
  const tone = gaugeToneForPercentile(metric.percentileRank);

  return (
    <Card className="border-border/80 shadow-sm">
      <CardContent className="flex gap-3 p-4">
        <PercentileGauge rank={metric.percentileRank} />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium leading-tight">{metric.label}</p>
            <Badge variant="secondary" className={cn("shrink-0 text-[10px]", GAUGE_TONE_BADGE[tone])}>
              P{metric.percentileRank.toFixed(0)}
            </Badge>
          </div>
          <p className="text-lg font-semibold">{formatBenchmarkValue(metric)}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span>Industry {metric.industryAverage.toFixed(metric.unit === "currency" ? 0 : 1)}{metric.unit === "percent" ? "%" : metric.unit === "currency" ? "" : ""}</span>
            <span>Top {metric.topQuartile.toFixed(metric.unit === "currency" ? 0 : 1)}{metric.unit === "percent" ? "%" : ""}</span>
            <span className="inline-flex items-center gap-0.5">
              <TrendIcon trend={metric.trend} />
              {metric.trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BenchmarkDashboard({
  data,
  cohortOptions,
  selectedCohortId,
  radarMetrics,
  opportunities,
  history,
  contribution,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [contributing, startContribute] = useTransition();

  const metricsByCategory = useMemo(() => {
    const map = new Map<string, BenchmarkMetric[]>();
    for (const m of data.metrics) {
      const list = map.get(m.category) ?? [];
      list.push(m);
      map.set(m.category, list);
    }
    return map;
  }, [data.metrics]);

  function onCohortChange(cohortId: string) {
    startTransition(() => {
      router.push(`/dashboard/analytics/benchmarks?cohort=${encodeURIComponent(cohortId)}`);
    });
  }

  function onContribute() {
    startContribute(async () => {
      try {
        const result = await contributeBenchmarkDataAction();
        toast.success(
          `Contributed ${result.metricsShared} anonymized metrics to ${result.cohortId}. Thank you!`,
        );
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Contribution failed.");
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="benchmark-dashboard">
      <AiHonestyBanner moduleId="benchmark-network" />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Benchmark Network</h1>
          <p className="text-muted-foreground max-w-2xl">
            AI-assisted peer comparison — {data.summary.metricCount} metrics vs{" "}
            {data.cohort.label.toLowerCase()} (n≈{data.cohort.sampleSize.toLocaleString()}).
            Confidence {Math.round(data.confidence * 100)}%.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex flex-wrap justify-end gap-2">
            <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="network-effects-link">
              <Link href="/dashboard/analytics/network">Network effects →</Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="rounded-full" data-testid="benchmark-premium-link">
              <Link href="/dashboard/analytics/benchmarks/premium">Benchmark Premium →</Link>
            </Button>
          </div>
          <label htmlFor="benchmark-cohort" className="text-xs font-medium text-muted-foreground self-stretch">
            Peer group
          </label>
          <select
            id="benchmark-cohort"
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={selectedCohortId}
            disabled={pending}
            onChange={(e) => onCohortChange(e.target.value)}
          >
            {cohortOptions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label} (n≈{c.sampleSize.toLocaleString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Average percentile</CardDescription>
            <CardTitle className="text-2xl">{data.summary.averagePercentile.toFixed(0)}th</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Across {data.summary.metricCount} tracked metrics
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Above top quartile</CardDescription>
            <CardTitle className="text-2xl text-emerald-600">{data.summary.aboveTopQuartile}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Metrics beating top 25% of peers</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Below bottom quartile</CardDescription>
            <CardTitle className="text-2xl text-red-600">{data.summary.belowBottomQuartile}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Metrics needing immediate attention</CardContent>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Cohort sample</CardDescription>
            <CardTitle className="text-2xl">{data.cohort.sampleSize.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">Anonymized restaurants in peer group</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" aria-hidden />
              Performance radar
            </CardTitle>
            <CardDescription>Your percentile vs industry (50th) and top quartile (75th) — 8 core metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {radarMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarMetrics} cx="50%" cy="50%" outerRadius="70%">
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="You" dataKey="you" stroke={benchmarkRadarColors.you} fill={benchmarkRadarColors.you} fillOpacity={0.35} />
                  <Radar name="Industry avg" dataKey="industry" stroke={benchmarkRadarColors.industry} fill={benchmarkRadarColors.industry} fillOpacity={0.15} />
                  <Radar name="Top quartile" dataKey="topQuartile" stroke={benchmarkRadarColors.topQuartile} fill={benchmarkRadarColors.topQuartile} fillOpacity={0.1} />
                  <Legend />
                  <Tooltip formatter={(v: number) => `${v.toFixed(0)}th percentile`} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">Not enough metrics for radar chart.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" aria-hidden />
              Historical comparison
            </CardTitle>
            <CardDescription>Average percentile rank over time (30-day window)</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {history.length >= 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v.toFixed(1)}th`, "Avg percentile"]}
                    labelFormatter={(l) => `Date: ${l}`}
                  />
                  <Line type="monotone" dataKey="averagePercentile" stroke={benchmarkRadarColors.trendLine} strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                History builds as you revisit this page. Current: {data.summary.averagePercentile.toFixed(0)}th percentile.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {opportunities.length > 0 ? (
        <Card className="border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Opportunities</CardTitle>
            <CardDescription>
              Estimated monthly impact if weak metrics reach top-quartile peers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {opportunities.map((o) => (
              <div
                key={o.metricKey}
                className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/20 p-3"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{o.label}</p>
                    <Badge variant="outline" className="text-[10px]">
                      P{o.percentileRank.toFixed(0)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{o.action}</p>
                  <p className="text-xs">
                    Current {o.currentValue.toFixed(1)}{o.unit} → target {o.targetValue.toFixed(1)}{o.unit}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-semibold text-emerald-600">
                    +${o.estimatedImpactUsd.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">est. monthly</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All metrics</h2>
        {Array.from(metricsByCategory.entries()).map(([category, metrics]) => (
          <div key={category} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{category}</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {metrics.map((m) => (
                <MetricCard key={m.key} metric={m} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <Card className="border-border/80 shadow-sm bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Network className="h-4 w-4" aria-hidden />
            Data contribution
          </CardTitle>
          <CardDescription>How your anonymized data powers the benchmark network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-muted-foreground text-xs">Network restaurants</p>
              <p className="font-semibold">{contribution.networkRestaurants.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Live contributors</p>
              <p className="font-semibold">{contribution.liveContributors.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Cohorts available</p>
              <p className="font-semibold">{contribution.cohortsAvailable}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Your contribution</p>
              <p className="font-semibold">{contribution.contributing ? "Active" : "Not yet opted in"}</p>
            </div>
            {contribution.metricsShared > 0 ? (
              <div>
                <p className="text-muted-foreground text-xs">Metrics shared</p>
                <p className="font-semibold">{contribution.metricsShared}</p>
              </div>
            ) : null}
            {contribution.anonId ? (
              <div>
                <p className="text-muted-foreground text-xs">Anon ID</p>
                <p className="font-mono text-xs">{contribution.anonId}</p>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border bg-background p-3 space-y-1">
            <p className="text-xs font-medium">Network impact</p>
            <p className="text-sm">{contribution.contributionImpact}</p>
            {contribution.contributionImpactScore > 0 ? (
              <p className="text-xs text-muted-foreground">
                Impact score: {contribution.contributionImpactScore.toFixed(1)} / 100
              </p>
            ) : null}
          </div>

          {!contribution.contributing ? (
            <Button type="button" size="sm" onClick={onContribute} disabled={contributing}>
              {contributing ? "Contributing…" : "Contribute anonymized data"}
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Contributing
              </Badge>
              {contribution.lastContributedAt ? (
                <span className="text-xs text-muted-foreground">
                  Last updated {new Date(contribution.lastContributedAt).toLocaleDateString()}
                </span>
              ) : null}
              <Button type="button" size="sm" variant="outline" onClick={onContribute} disabled={contributing}>
                {contributing ? "Updating…" : "Refresh contribution"}
              </Button>
            </div>
          )}

          <p className="flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
            {contribution.privacyNote}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
