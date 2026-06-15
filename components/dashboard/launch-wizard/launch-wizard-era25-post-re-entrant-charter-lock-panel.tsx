import Link from "next/link";
import { Lock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-post-re-entrant-charter-lock-era57";
import type { LaunchWizardEra25PostReentrantCharterLockSlice } from "@/lib/launch-wizard/launch-wizard-era25-post-re-entrant-charter-lock-era57";

export function LaunchWizardEra25PostReentrantCharterLockPanel(props: {
  slice: LaunchWizardEra25PostReentrantCharterLockSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_POST_REENTRANT_CHARTER_LOCK_ANCHOR.slice(1)}
      className="scroll-mt-24 border-slate-300/80 bg-slate-50/30 shadow-sm dark:border-slate-700/50"
      data-testid="launch-wizard-era25-post-re-entrant-charter-lock-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-950 dark:text-slate-100">
          <Lock className="h-5 w-5 shrink-0" aria-hidden />
          Era25 post-re-entrant charter lock
        </CardTitle>
        <CardDescription>
          Freeze era25 linear convergence and charter attest env keys — improvement loop is the only mutable path.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.goDecision}
          </Badge>
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.progressLabel}
          </Badge>
          {slice.charterLockBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Charter lock blocked
            </Badge>
          ) : null}
          {slice.era25PostReentrantCharterLockIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Charter lock integrity FAIL
            </Badge>
          ) : null}
          {slice.frozenEnvMutationDetected ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Frozen env mutation
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Charter lock checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.improvementLoopHref}>Improvement loop</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.governanceBundlesCertCommand}</p>
      </CardContent>
    </Card>
  );
}
