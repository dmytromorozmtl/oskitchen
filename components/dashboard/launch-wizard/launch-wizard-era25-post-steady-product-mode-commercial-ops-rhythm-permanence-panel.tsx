import Link from "next/link";
import { Repeat } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68";
import type { LaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-era68";

export function LaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanencePanel(props: {
  slice: LaunchWizardEra25PostSteadyProductModeCommercialOpsRhythmPermanenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_POST_STEADY_PRODUCT_MODE_COMMERCIAL_OPS_RHYTHM_PERMANENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-amber-300/80 bg-amber-50/30 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/20"
      data-testid="launch-wizard-era25-post-steady-product-mode-commercial-ops-rhythm-permanence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <Repeat className="h-5 w-5 shrink-0" aria-hidden />
          Era25 commercial ops rhythm permanence
        </CardTitle>
        <CardDescription>
          Locks honest commercial artifact rhythm after steady product mode — improvement loop remains sole governance surface.
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
          {slice.postSteadyProductModeCommercialOpsRhythmPermanenceActive ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Ops rhythm permanent
            </Badge>
          ) : null}
          {slice.rhythmPermanenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Permanence blocked
            </Badge>
          ) : null}
          {slice.era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Rhythm permanence integrity FAIL
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
            <Link href={slice.platformOpsHref}>Rhythm permanence</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>Permanence checklist</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.governanceBundlesCertCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.commercialPilotRunbookCertCommand}</p>
      </CardContent>
    </Card>
  );
}
