import Link from "next/link";
import { Infinity } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65";
import type { LaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-era65";

export function LaunchWizardEra25PostTerminalSealCommercialOpsPermanencePanel(props: {
  slice: LaunchWizardEra25PostTerminalSealCommercialOpsPermanenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_POST_TERMINAL_SEAL_COMMERCIAL_OPS_PERMANENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-sky-300/80 bg-sky-50/30 shadow-sm dark:border-sky-700/50 dark:bg-sky-950/20"
      data-testid="launch-wizard-era25-post-terminal-seal-commercial-ops-permanence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-sky-950 dark:text-sky-100">
          <Infinity className="h-5 w-5 shrink-0" aria-hidden />
          Era25 post-terminal-seal commercial ops permanence
        </CardTitle>
        <CardDescription>
          Sustained honest commercial artifact rhythm after governance train seal — improvement loop only for governance.
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
          {slice.postTerminalSealCommercialOpsPermanenceActive ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              Ops permanence
            </Badge>
          ) : null}
          {slice.permanenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Permanence blocked
            </Badge>
          ) : null}
          {slice.era25PostTerminalSealCommercialOpsPermanenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Permanence integrity FAIL
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
            <Link href={slice.launchWizardHref}>Permanence checklist</Link>
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
