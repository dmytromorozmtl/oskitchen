import Link from "next/link";
import { Snowflake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-convergence-governance-terminus-freeze-era60";
import type { LaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice } from "@/lib/launch-wizard/launch-wizard-era25-convergence-governance-terminus-freeze-era60";

export function LaunchWizardEra25ConvergenceGovernanceTerminusFreezePanel(props: {
  slice: LaunchWizardEra25ConvergenceGovernanceTerminusFreezeSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_CONVERGENCE_GOVERNANCE_TERMINUS_FREEZE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-slate-300/80 bg-slate-50/40 shadow-sm dark:border-slate-600/50"
      data-testid="launch-wizard-era25-convergence-governance-terminus-freeze-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-950 dark:text-slate-100">
          <Snowflake className="h-5 w-5 shrink-0" aria-hidden />
          Era25 convergence governance terminus freeze
        </CardTitle>
        <CardDescription>
          Final freeze of era47–AI governance env chain — era25 convergence UI suppressed; Band A P0 execution remains.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.goDecision}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            P0 {slice.p0ProofStatus ?? "n/a"}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.progressLabel}
          </Badge>
          {slice.era25ProductConvergenceSurfacesSuppressed ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Convergence suppressed
            </Badge>
          ) : null}
          {slice.terminusFreezeBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Terminus freeze blocked
            </Badge>
          ) : null}
          {slice.era25ConvergenceGovernanceTerminusFreezeIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Terminus integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Terminus freeze checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.p0OpsVaultHref}>P0 ops vault</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.governanceBundlesCertCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.commercialPilotRunbookCertCommand}</p>
      </CardContent>
    </Card>
  );
}
