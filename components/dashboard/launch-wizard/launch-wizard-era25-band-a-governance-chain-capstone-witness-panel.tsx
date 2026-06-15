import Link from "next/link";
import { Landmark } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-band-a-governance-chain-capstone-witness-era66";
import type { LaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-band-a-governance-chain-capstone-witness-era66";

export function LaunchWizardEra25BandAGovernanceChainCapstoneWitnessPanel(props: {
  slice: LaunchWizardEra25BandAGovernanceChainCapstoneWitnessSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_BAND_A_GOVERNANCE_CHAIN_CAPSTONE_WITNESS_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-300/80 bg-violet-50/30 shadow-sm dark:border-violet-700/50 dark:bg-violet-950/20"
      data-testid="launch-wizard-era25-band-a-governance-chain-capstone-witness-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <Landmark className="h-5 w-5 shrink-0" aria-hidden />
          Era25 Band A governance chain capstone witness
        </CardTitle>
        <CardDescription>
          Terminal witness that era61–AO governance stack is honestly closed — post-governance steady product ops only.
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
          {slice.bandAGovernanceChainCapstoneWitnessActive ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Band A closed
            </Badge>
          ) : null}
          {slice.capstoneWitnessBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Capstone blocked
            </Badge>
          ) : null}
          {slice.era25BandAGovernanceChainCapstoneWitnessIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Capstone integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.platformOpsHref}>Capstone witness</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.commercialOpsHref}>Commercial ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>Witness checklist</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.governanceBundlesCertCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.commercialPilotRunbookCertCommand}</p>
      </CardContent>
    </Card>
  );
}
