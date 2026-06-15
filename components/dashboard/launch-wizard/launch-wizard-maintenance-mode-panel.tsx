import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";
import type { LaunchWizardMaintenanceModeSlice } from "@/lib/launch-wizard/launch-wizard-maintenance-mode-era36";

export function LaunchWizardMaintenanceModePanel(props: {
  slice: LaunchWizardMaintenanceModeSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_MAINTENANCE_MODE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-slate-200/80 bg-slate-50/20 shadow-sm dark:border-slate-800/60"
      data-testid="launch-wizard-maintenance-mode-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-slate-950 dark:text-slate-100">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden />
          Maintenance mode
        </CardTitle>
        <CardDescription>
          Commercial pilot path complete — operator rhythms use artifact freshness; never hand-edit PASS
          in artifacts.
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
          {slice.maintenanceModeIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Maintenance mode blocked
            </Badge>
          ) : null}
          {slice.productEvolutionIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Product evolution integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Maintenance mode checklist</Link>
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
          {slice.postProductEvolutionOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
