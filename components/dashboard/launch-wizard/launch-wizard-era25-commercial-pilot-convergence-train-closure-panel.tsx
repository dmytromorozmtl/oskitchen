import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-closure-era55";
import type { LaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-closure-era55";

export function LaunchWizardEra25CommercialPilotConvergenceTrainClosurePanel(props: {
  slice: LaunchWizardEra25CommercialPilotConvergenceTrainClosureSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CLOSURE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-amber-200/80 bg-amber-50/20 shadow-sm dark:border-amber-900/50"
      data-testid="launch-wizard-era25-commercial-pilot-convergence-train-closure-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Era25 commercial pilot convergence train closure
        </CardTitle>
        <CardDescription>
          Rollup integrity for era47–era54 convergence baselines — only after pure operational mode is active.
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
            {slice.convergenceIntegrityBaselinesHonestCount}/{slice.convergenceIntegrityBaselinesTotalCount}{" "}
            baselines
          </Badge>
          {slice.trainClosureBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Train closure blocked
            </Badge>
          ) : null}
          {slice.era25CommercialPilotConvergenceTrainClosureIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Train closure integrity FAIL
            </Badge>
          ) : null}
          {slice.pureOperationalModeTerminusConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Pure ops integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Train closure checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.commercialPilotRunbookCertCommand}</p>
      </CardContent>
    </Card>
  );
}
