import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";
import type { LaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-era69";

export function LaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessPanel(props: {
  slice: LaunchWizardEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_POST_RHYTHM_PERMANENCE_BAND_A_GOVERNANCE_TERMINAL_CLOSURE_WITNESS_ANCHOR.slice(
        1,
      )}
      className="scroll-mt-24 border-emerald-300/80 bg-emerald-50/30 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/20"
      data-testid="launch-wizard-era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Era25 Band A governance terminal closure witness
        </CardTitle>
        <CardDescription>
          Final witness that era61–AR governance stack is permanently closed — improvement loop + honest commercial artifacts only.
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
          {slice.postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Band A closed
            </Badge>
          ) : null}
          {slice.terminalClosureWitnessBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Witness blocked
            </Badge>
          ) : null}
          {slice.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Terminal closure witness integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.commercialOpsHref}>Commercial ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Terminal closure witness</Link>
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
