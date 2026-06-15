"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  BarChart3,
  CheckCircle2,
  Circle,
  Lock,
  Network,
  Shield,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

import { contributeNetworkEffectsAction } from "@/actions/network-effects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  CohortNetworkInsight,
  NetworkEffectsDashboard,
  NetworkMilestone,
} from "@/lib/ai/network-effects-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: NetworkEffectsDashboard;
};

function MilestoneIcon({ status }: { status: NetworkMilestone["status"] }) {
  if (status === "complete") {
    return <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />;
  }
  if (status === "active") {
    return <Sparkles className="h-5 w-5 text-amber-500" aria-hidden />;
  }
  return <Lock className="h-5 w-5 text-muted-foreground" aria-hidden />;
}

function CohortRow({ insight }: { insight: CohortNetworkInsight }) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background px-3 py-2"
      data-testid={`network-cohort-${insight.cohortId}`}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium">{insight.label}</p>
        <p className="text-xs text-muted-foreground">
          Seed n≈{insight.seedSampleSize.toLocaleString()} · Live +{insight.liveContributors}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary">{insight.metricsRefined} metrics live</Badge>
        {insight.precisionBoostPercent > 0 ? (
          <Badge className="bg-emerald-600 hover:bg-emerald-600">
            +{insight.precisionBoostPercent.toFixed(1)}% precision
          </Badge>
        ) : null}
      </div>
    </div>
  );
}

export function NetworkEffectsPanel({ dashboard }: Props) {
  const router = useRouter();
  const [contributing, startContribute] = useTransition();
  const { status, intelligence, contribution } = dashboard;

  function onContribute() {
    startContribute(async () => {
      try {
        const result = await contributeNetworkEffectsAction();
        if (!result.ok) {
          toast.error(result.error ?? "Contribution failed.");
          return;
        }
        toast.success(result.data?.message ?? "Contributed to the network.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Contribution failed.");
      }
    });
  }

  return (
    <div className="space-y-6" data-testid="network-effects-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Network className="h-7 w-7 text-primary" aria-hidden />
            Restaurant Network Effects
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">{dashboard.tagline}</p>
        </div>
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/analytics/benchmarks">
            <BarChart3 className="mr-1.5 h-4 w-4" aria-hidden />
            Benchmarks
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Network intelligence</CardDescription>
            <CardTitle className="text-3xl">{intelligence.index.toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{intelligence.label}</Badge>
            <p className="mt-2 text-xs text-muted-foreground">{intelligence.summary}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Restaurants in network</CardDescription>
            <CardTitle className="text-3xl">{status.totalRestaurants.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            {status.liveContributors} live · {status.cohortsAvailable} cohorts
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Models refined</CardDescription>
            <CardTitle className="text-3xl">{intelligence.modelsRefined}</CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Benchmark · Co-Pilot · Camera priors
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cohort precision</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-1">
              <TrendingUp className="h-6 w-6 text-emerald-600" aria-hidden />
              +{intelligence.precisionBoostPercent.toFixed(1)}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">{status.contributionImpact}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Network milestones</CardTitle>
            <CardDescription>Unlock smarter forecasts as more peers contribute anonymized KPIs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboard.milestones.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex gap-3 rounded-lg border p-3",
                  m.status === "complete" && "border-emerald-200/80 bg-emerald-50/50 dark:bg-emerald-950/20",
                  m.status === "active" && "border-amber-200/80 bg-amber-50/40 dark:bg-amber-950/20",
                )}
                data-testid={m.id}
              >
                <MilestoneIcon status={m.status} />
                <div>
                  <p className="text-sm font-medium">
                    {m.title}{" "}
                    <span className="text-muted-foreground font-normal">
                      ({m.targetContributors} contributors)
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your contribution</CardTitle>
            <CardDescription>One-way hash ID — no PII leaves your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              {contribution.contributing ? (
                <Badge className="bg-emerald-600 hover:bg-emerald-600">Active contributor</Badge>
              ) : (
                <Badge variant="secondary">Not contributing yet</Badge>
              )}
              {contribution.metricsShared > 0 ? (
                <span className="text-xs text-muted-foreground">{contribution.metricsShared} metrics</span>
              ) : null}
            </div>
            {contribution.anonId ? (
              <p className="font-mono text-xs text-muted-foreground">Anon ID {contribution.anonId}</p>
            ) : (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Circle className="h-3 w-3" aria-hidden />
                Join the mesh to sharpen benchmarks for your cohort.
              </p>
            )}
            <Button
              type="button"
              size="sm"
              data-testid="network-effects-contribute"
              disabled={contributing}
              onClick={onContribute}
            >
              {contributing
                ? "Contributing…"
                : contribution.contributing
                  ? "Refresh contribution"
                  : "Contribute anonymized KPIs"}
            </Button>
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
              Values are bucketed; workspace identity is a SHA-256 hash only.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cohort intelligence mesh</CardTitle>
          <CardDescription>Live peer deltas layered on seed industry baselines.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {dashboard.cohortInsights.map((insight) => (
            <CohortRow key={insight.cohortId} insight={insight} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
