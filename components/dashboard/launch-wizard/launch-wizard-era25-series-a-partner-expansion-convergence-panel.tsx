import Link from "next/link";
import { Handshake } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR } from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";
import type { LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice } from "@/lib/launch-wizard/launch-wizard-era25-series-a-partner-expansion-convergence-era51";

export function LaunchWizardEra25SeriesAPartnerExpansionConvergencePanel(props: {
  slice: LaunchWizardEra25SeriesAPartnerExpansionConvergenceSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_ERA25_SERIES_A_PARTNER_EXPANSION_CONVERGENCE_ANCHOR.slice(1)}
      className="scroll-mt-24 border-amber-200/80 bg-amber-50/20 shadow-sm dark:border-amber-900/50"
      data-testid="launch-wizard-era25-series-a-partner-expansion-convergence-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-amber-950 dark:text-amber-100">
          <Handshake className="h-5 w-5 shrink-0" aria-hidden />
          Era25 Series A partner expansion convergence
        </CardTitle>
        <CardDescription>
          Tracks A–D for fundraise + channel expansion — only after scale readiness convergence ready.
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
          <Badge variant="outline" className="rounded-full text-[10px]">
            {slice.completedBlockingCount}/{slice.totalBlockingCount} tracks
          </Badge>
          {slice.convergenceBlocked ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Series A blocked
            </Badge>
          ) : null}
          {slice.seriesAPartnerExpansionConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Series A integrity FAIL
            </Badge>
          ) : null}
          {slice.scaleReadinessConvergenceIntegrityFailed ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              Scale integrity FAIL
            </Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.launchWizardHref}>Series A checklist</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.platformOpsHref}>Platform ops</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.reportsHref}>Reports</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>Integration health</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">
          {slice.postScaleConvergenceOrchestratorCommand}
        </p>
      </CardContent>
    </Card>
  );
}
