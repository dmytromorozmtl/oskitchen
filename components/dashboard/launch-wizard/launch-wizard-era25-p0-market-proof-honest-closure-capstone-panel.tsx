import Link from "next/link";
import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62";
import type { LaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice } from "@/lib/launch-wizard/launch-wizard-era25-p0-market-proof-honest-closure-capstone-era62";

export function LaunchWizardEra25P0MarketProofHonestClosureCapstonePanel(props: {
  slice: LaunchWizardEra25P0MarketProofHonestClosureCapstoneSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_P0_MARKET_PROOF_HONEST_CLOSURE_CAPSTONE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-amber-300/80 bg-amber-50/30 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/20"
      data-testid="launch-wizard-era25-p0-market-proof-honest-closure-capstone-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <Trophy className="h-5 w-5 shrink-0" aria-hidden />
          Era25 P0 market proof honest closure capstone
        </CardTitle>
        <CardDescription>
          Terminal Band A milestone — attest only when P0 artifact is honestly proof_passed after sole-path lock.
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
          {slice.era25MarketProofGovernanceChainClosed ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Governance closed
            </Badge>
          ) : null}
          {slice.closureCapstoneBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Closure blocked
            </Badge>
          ) : null}
          {slice.era25P0MarketProofHonestClosureCapstoneIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Closure integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.p0OpsVaultHref}>P0 ops vault</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.launchWizardHref}>Closure checklist</Link>
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
