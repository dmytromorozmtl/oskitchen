"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BarChart3, Crown, FileText, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

import {
  startBenchmarkPremiumTrialAction,
  subscribeBenchmarkPremiumAction,
} from "@/actions/benchmark-premium";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BenchmarkPremiumDashboard, IndustryBenchmarkReport } from "@/lib/ai/benchmark-2.0-types";
import { cn } from "@/lib/utils";

type Props = {
  dashboard: BenchmarkPremiumDashboard;
};

function ReportCard({ report, isPremium }: { report: IndustryBenchmarkReport; isPremium: boolean }) {
  const locked = report.locked || !isPremium;

  return (
    <Card className="border-border/80" data-testid={`benchmark-report-${report.id}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
              {report.title}
            </CardTitle>
            <CardDescription>
              {report.periodLabel} · {report.cohortLabel}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {report.cadence}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className={cn("text-sm", locked && "blur-[3px] select-none")}>{report.executiveSummary}</p>
        {locked ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/40 p-3 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 shrink-0" aria-hidden />
            Unlock Benchmark Premium to read full industry sections and export PDF.
          </div>
        ) : (
          <div className="space-y-3">
            {report.sections.map((section) => (
              <div key={section.id} className="rounded-lg border bg-background p-3">
                <p className="text-xs font-medium text-muted-foreground">{section.title}</p>
                <p className="mt-1 text-sm">{section.body}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function BenchmarkPremiumPanel({ dashboard }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selectedReportId, setSelectedReportId] = useState(dashboard.reports[0]?.id ?? "");

  const selected = dashboard.reports.find((r) => r.id === selectedReportId) ?? dashboard.reports[0];

  function run(action: () => Promise<{ ok: boolean; error?: string; data?: { message?: string } }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "Request failed.");
        return;
      }
      toast.success(result.data?.message ?? "Updated.");
      router.refresh();
    });
  }

  const { subscription, isPremium } = dashboard;

  return (
    <div className="space-y-6" data-testid="benchmark-premium-panel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" aria-hidden />
            Benchmark Network 2.0
          </h1>
          <p className="text-muted-foreground max-w-2xl text-sm">
            Industry reports, peer deep-dives, and paid benchmark subscriptions — built on your live KPI
            cohort ({dashboard.benchmark.data.cohort.label}).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/analytics/network">Network effects</Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/dashboard/analytics/benchmarks">
              <BarChart3 className="mr-1.5 h-4 w-4" aria-hidden />
              Free benchmarks
            </Link>
          </Button>
        </div>
      </div>

      <Card className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-background dark:from-amber-950/30">
        <CardHeader>
          <CardTitle className="text-lg">Benchmark Premium</CardTitle>
          <CardDescription>
            ${subscription.priceUsdMonthly}/month · monthly & quarterly industry PDFs · unlimited cohort
            switches
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {isPremium ? (
            <Badge className="bg-emerald-600 hover:bg-emerald-600">
              {subscription.includedWithPlan ? "Included with PRO/TEAM" : "Premium active"}
            </Badge>
          ) : (
            <>
              <Button
                type="button"
                size="sm"
                data-testid="benchmark-premium-trial"
                disabled={pending}
                onClick={() => run(startBenchmarkPremiumTrialAction)}
              >
                <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
                Start 14-day trial
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-testid="benchmark-premium-subscribe"
                disabled={pending}
                onClick={() => run(subscribeBenchmarkPremiumAction)}
              >
                Subscribe ${subscription.priceUsdMonthly}/mo
              </Button>
            </>
          )}
          {subscription.currentPeriodEnd ? (
            <span className="text-xs text-muted-foreground">
              Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </span>
          ) : null}
          {!dashboard.stripeCheckoutAvailable && !isPremium ? (
            <span className="text-xs text-muted-foreground">
              Stripe checkout optional — trial activates instantly in workspace settings.
            </span>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground px-1">Industry reports</p>
          {dashboard.reports.map((report) => (
            <button
              key={report.id}
              type="button"
              className={cn(
                "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                selectedReportId === report.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/50",
              )}
              onClick={() => setSelectedReportId(report.id)}
            >
              <span className="font-medium">{report.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{report.periodLabel}</span>
            </button>
          ))}
        </div>
        {selected ? <ReportCard report={selected} isPremium={isPremium} /> : null}
      </div>
    </div>
  );
}
