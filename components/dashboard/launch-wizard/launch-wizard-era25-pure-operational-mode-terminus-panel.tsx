import Link from "next/link";
import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-pure-operational-mode-terminus-era54";
import type { LaunchWizardEra25PureOperationalModeTerminusSlice } from "@/lib/launch-wizard/launch-wizard-era25-pure-operational-mode-terminus-era54";

export function LaunchWizardEra25PureOperationalModeTerminusPanel(props: {
  slice: LaunchWizardEra25PureOperationalModeTerminusSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_PURE_OPERATIONAL_MODE_TERMINUS_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-era25-pure-operational-mode-terminus-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Flag className="h-5 w-5 shrink-0" aria-hidden />
          Era25 pure operational mode terminus
        </CardTitle>
        <CardDescription>
          Final era25 slice — improvement-loop freshness and gate suppression after sustained ops convergence ready.
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
            {slice.healthyCount}/{slice.trackCount} tracks
          </Badge>
          {slice.terminusBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Terminus blocked
            </Badge>
          ) : null}
          {slice.pureOperationalModeTerminusConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Pure ops integrity FAIL
            </Badge>
          ) : null}
          {slice.sustainedOperationalExcellenceConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sustained ops integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Terminus checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postSustainedOpsConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
