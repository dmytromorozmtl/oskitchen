import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";
import type { LaunchWizardEra25Month2MarketReadinessConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-month2-market-readiness-convergence-era49";

export function LaunchWizardEra25Month2MarketReadinessConvergencePanel(props: {
  slice: LaunchWizardEra25Month2MarketReadinessConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_MONTH2_MARKET_READINESS_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-indigo-200/80 bg-indigo-50/20 shadow-sm dark:border-indigo-900/50"
      data-testid="launch-wizard-era25-month2-market-readiness-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-indigo-950 dark:text-indigo-100">
          <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
          Era25 month 2 market readiness convergence
        </CardTitle>
        <CardDescription>
          Workstreams A–E on real pilot traction — only after pilot week 1 execution convergence ready.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.goDecision}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.progressLabel}
          </Badge>
          {slice.customerName ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {slice.customerName}
            </Badge>
          ) : null}
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.completedBlockingCount}/{slice.totalBlockingCount} workstreams
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Month 2 blocked
            </Badge>
          ) : null}
          {slice.month2MarketReadinessConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Month 2 integrity FAIL
            </Badge>
          ) : null}
          {slice.pilotWeek1ExecutionConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Week 1 integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Month 2 checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.ghostKitchenLandingHref}>ICP landings</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postWeek1ConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
