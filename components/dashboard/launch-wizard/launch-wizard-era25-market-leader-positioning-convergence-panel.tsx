import Link from "next/link";
import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-era52";
import type { LaunchWizardEra25MarketLeaderPositioningConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-market-leader-positioning-convergence-era52";

export function LaunchWizardEra25MarketLeaderPositioningConvergencePanel(props: {
  slice: LaunchWizardEra25MarketLeaderPositioningConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_MARKET_LEADER_POSITIONING_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-era25-market-leader-positioning-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Trophy className="h-5 w-5 shrink-0" aria-hidden />
          Era25 market leader positioning convergence
        </CardTitle>
        <CardDescription>
          Pillars 1–4 for category leadership — only after Series A partner expansion convergence ready.
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
            {slice.completedBlockingCount}/{slice.totalBlockingCount} pillars
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Market leader blocked
            </Badge>
          ) : null}
          {slice.marketLeaderPositioningConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Market leader integrity FAIL
            </Badge>
          ) : null}
          {slice.seriesAPartnerExpansionConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Series A integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Market leader checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.reportsHref}>Reports</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.ghostKitchenLandingHref}>Category narrative</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postSeriesAConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
