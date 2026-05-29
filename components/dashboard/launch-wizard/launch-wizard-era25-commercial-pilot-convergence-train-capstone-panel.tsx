import Link from "next/link";
import { Flag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59";
import type { LaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice } from "@/lib/launch-wizard/launch-wizard-era25-commercial-pilot-convergence-train-capstone-era59";

export function LaunchWizardEra25CommercialPilotConvergenceTrainCapstonePanel(props: {
  slice: LaunchWizardEra25CommercialPilotConvergenceTrainCapstoneSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_COMMERCIAL_PILOT_CONVERGENCE_TRAIN_CAPSTONE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-300/80 bg-violet-50/30 shadow-sm dark:border-violet-700/50"
      data-testid="launch-wizard-era25-commercial-pilot-convergence-train-capstone-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Flag className="h-5 w-5 shrink-0" aria-hidden />
          Era25 commercial pilot convergence train capstone
        </CardTitle>
        <CardDescription>
          Honest closure of era47–AH governance train — references P0 artifact status without faking proof_passed.
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
          {slice.trainCapstoneBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Capstone blocked
            </Badge>
          ) : null}
          {slice.era25CommercialPilotConvergenceTrainCapstoneIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Capstone integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Train capstone checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.p0OpsVaultHref}>P0 ops vault</Link>
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
