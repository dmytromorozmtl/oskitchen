import Link from "next/link";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-governance-train-terminal-seal-era64";
import type { LaunchWizardEra25GovernanceTrainTerminalSealSlice } from "@/lib/launch-wizard/launch-wizard-era25-governance-train-terminal-seal-era64";

export function LaunchWizardEra25GovernanceTrainTerminalSealPanel(props: {
  slice: LaunchWizardEra25GovernanceTrainTerminalSealSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_GOVERNANCE_TRAIN_TERMINAL_SEAL_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-300/80 bg-violet-50/30 shadow-sm dark:border-violet-700/50 dark:bg-violet-950/20"
      data-testid="launch-wizard-era25-governance-train-terminal-seal-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Lock className="h-5 w-5 shrink-0" aria-hidden />
          Era25 governance train terminal seal
        </CardTitle>
        <CardDescription>
          Final seal on era47–AM convergence governance train — improvement loop + commercial ops on frozen artifacts only.
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
          {slice.era25GovernanceTrainSealed ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Train sealed
            </Badge>
          ) : null}
          {slice.sealBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Seal blocked
            </Badge>
          ) : null}
          {slice.era25GovernanceTrainTerminalSealIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Seal integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>Terminal seal checklist</Link>
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
