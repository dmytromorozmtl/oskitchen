import Link from "next/link";
import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67";
import type { LaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-era67";

export function LaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessPanel(props: {
  slice: LaunchWizardEra25PostBandAGovernanceSteadyProductModeWitnessSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_POST_BAND_A_GOVERNANCE_STEADY_PRODUCT_MODE_WITNESS_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-300/80 bg-emerald-50/30 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/20"
      data-testid="launch-wizard-era25-post-band-a-governance-steady-product-mode-witness-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <Sparkles className="h-5 w-5 shrink-0" aria-hidden />
          Era25 post-governance steady product mode witness
        </CardTitle>
        <CardDescription>
          Post-Band-A steady product ops — improvement loop + honest commercial artifacts only, zero era25 env mutation.
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
          {slice.postBandAGovernanceSteadyProductModeWitnessActive ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Steady product mode
            </Badge>
          ) : null}
          {slice.steadyProductModeWitnessBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Witness blocked
            </Badge>
          ) : null}
          {slice.era25PostBandAGovernanceSteadyProductModeWitnessIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Steady mode integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.platformOpsHref}>Steady product mode</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.commercialOpsHref}>Commercial ops</Link>
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
