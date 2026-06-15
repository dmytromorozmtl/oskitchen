import Link from "next/link";
import { Activity, ClipboardCheck, DollarSign, FileText, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_BENCHMARK_SUITE_P2_108_BENCHMARKS,
  AI_BENCHMARK_SUITE_P2_108_EYEBROW,
  AI_BENCHMARK_SUITE_P2_108_HEADLINE,
  AI_BENCHMARK_SUITE_P2_108_OPERATOR_LINKS,
  AI_BENCHMARK_SUITE_P2_108_SUBLINE,
} from "@/lib/ai/ai-benchmark-suite-p2-108-content";
import { AI_BENCHMARK_SUITE_P2_108_TEST_IDS } from "@/lib/ai/ai-benchmark-suite-p2-108-policy";
import type { AiBenchmarkSuiteSnapshot } from "@/services/ai/ai-benchmark-suite-p2-108-service";

const BENCHMARK_ICONS = [FileText, Activity, DollarSign, Users] as const;

/** Blueprint P2-108 — AI benchmark suite panel. */
export function AiBenchmarkSuitePanel({ snapshot }: { snapshot: AiBenchmarkSuiteSnapshot }) {
  return (
    <div className="space-y-8" data-testid={AI_BENCHMARK_SUITE_P2_108_TEST_IDS[0]}>
      <div className="space-y-3">
        <Badge variant="secondary" className="rounded-full">
          {AI_BENCHMARK_SUITE_P2_108_EYEBROW}
        </Badge>
        <h2 className="text-2xl font-semibold tracking-tight">
          {AI_BENCHMARK_SUITE_P2_108_HEADLINE}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {AI_BENCHMARK_SUITE_P2_108_SUBLINE}
        </p>
        <p className="text-xs text-muted-foreground">
          {snapshot.passedCount}/{snapshot.benchmarkCount} benchmarks pass · policy {snapshot.policyId}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Passed</CardDescription>
            <CardTitle className="text-2xl text-green-600">{snapshot.passedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl">{snapshot.failedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>Suite status</CardDescription>
            <CardTitle className="text-lg">
              {snapshot.passed ? (
                <span className="flex items-center gap-1 text-green-600">
                  <ClipboardCheck className="h-5 w-5" aria-hidden />
                  PASS
                </span>
              ) : (
                "FAIL"
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {AI_BENCHMARK_SUITE_P2_108_BENCHMARKS.map((benchmark, index) => {
          const Icon = BENCHMARK_ICONS[index] ?? FileText;
          const result = snapshot.benchmarks.find((b) => b.id === benchmark.id);
          return (
            <Card
              key={benchmark.id}
              className="border-border/80 shadow-sm"
              data-testid={AI_BENCHMARK_SUITE_P2_108_TEST_IDS[index + 1]}
            >
              <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{benchmark.label}</CardTitle>
                    {result && (
                      <Badge variant={result.passed ? "default" : "destructive"}>
                        {result.passed ? "PASS" : "FAIL"} · {result.scorePct}%
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="mt-1">{benchmark.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="font-mono text-xs text-muted-foreground">{benchmark.module}</p>
                <p className="text-xs text-muted-foreground">
                  Threshold: {benchmark.thresholdLabel}
                  {result ? ` · ${result.detail}` : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        {AI_BENCHMARK_SUITE_P2_108_OPERATOR_LINKS.map((link) => (
          <Button key={link.href} asChild variant="outline" size="sm" className="rounded-full">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
