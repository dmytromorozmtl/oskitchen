import Link from "next/link";
import { Route } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-band-a-market-proof-execution-sole-path-era61";
import type { LaunchWizardEra25BandAMarketProofExecutionSolePathSlice } from "@/lib/launch-wizard/launch-wizard-era25-band-a-market-proof-execution-sole-path-era61";

export function LaunchWizardEra25BandAMarketProofExecutionSolePathPanel(props: {
  slice: LaunchWizardEra25BandAMarketProofExecutionSolePathSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_BAND_A_MARKET_PROOF_EXECUTION_SOLE_PATH_ANCHOR.slice(1)}
      className="scroll-mt-24 border-emerald-300/80 bg-emerald-50/30 shadow-sm dark:border-emerald-700/50 dark:bg-emerald-950/20"
      data-testid="launch-wizard-era25-band-a-market-proof-execution-sole-path-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-emerald-950 dark:text-emerald-100">
          <Route className="h-5 w-5 shrink-0" aria-hidden />
          Era25 Band A market proof execution sole-path
        </CardTitle>
        <CardDescription>
          After governance terminus freeze — only improvement loop + P0 ops vault remain operator-mutable until honest proof_passed.
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
          {slice.bandAExecutionSolePathLocked ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Band A locked
            </Badge>
          ) : null}
          {slice.solePathBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sole-path blocked
            </Badge>
          ) : null}
          {slice.era25BandAMarketProofExecutionSolePathIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Sole-path integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.p0OpsVaultHref}>P0 ops vault</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>Sole-path checklist</Link>
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
