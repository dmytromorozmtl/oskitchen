import Link from "next/link";
import { Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR } from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";
import type { LaunchWizardLinearChainTerminusGuardSlice } from "@/lib/launch-wizard/launch-wizard-linear-chain-terminus-guard-era41";

export function LaunchWizardLinearChainTerminusGuardPanel(props: {
  slice: LaunchWizardLinearChainTerminusGuardSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_LINEAR_CHAIN_TERMINUS_GUARD_ANCHOR.slice(1)}
      className="scroll-mt-24 border-zinc-300/80 bg-zinc-50/30 shadow-sm dark:border-zinc-700/50"
      data-testid="launch-wizard-linear-chain-terminus-guard-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-zinc-950 dark:text-zinc-100">
          <Shield className="h-5 w-5 shrink-0" aria-hidden />
          Step 17 FORBIDDEN — linear chain terminus guard
        </CardTitle>
        <CardDescription>
          Not a catalog step · guards repo integrity after Step 16 · never hand-edit PASS in artifacts.
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
          {slice.customerName ? (
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {slice.customerName}
            </Badge>
          ) : null}
          {slice.linearChainTerminusGuardIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Step 17 guard blocked
            </Badge>
          ) : null}
          {slice.linearPathPermanentlyClosedIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Linear path integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Step 17 guard checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.todayHref}>Today</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postLinearPathClosedOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
