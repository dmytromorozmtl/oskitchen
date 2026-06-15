import Link from "next/link";
import { TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";
import type { LaunchWizardCommercialInflectionSlice } from "@/lib/launch-wizard/launch-wizard-commercial-inflection-era28";

export function LaunchWizardCommercialInflectionPanel(props: {
  slice: LaunchWizardCommercialInflectionSlice;
}) {
  const { slice } = props;

  return (
    <Card
      id={LAUNCH_WIZARD_COMMERCIAL_INFLECTION_ANCHOR.slice(1)}
      className="scroll-mt-24 border-violet-200/80 bg-violet-50/20 shadow-sm dark:border-violet-900/50"
      data-testid="launch-wizard-commercial-inflection-panel"
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg text-violet-950 dark:text-violet-100">
          <TrendingUp className="h-5 w-5 shrink-0" aria-hidden />
          Commercial inflection gate
        </CardTitle>
        <CardDescription>
          Governance 100/100 is wired — pilot executable score is market readiness. SKIPPED ≠ PASS.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="rounded-full font-mono text-[10px]">
            {slice.milestoneLabel}
          </Badge>
          <Badge variant="secondary" className="rounded-full text-[10px] tabular-nums">
            {slice.scorecardLabel}
          </Badge>
          {slice.p0VaultMissingCount > 0 ? (
            <Badge variant="destructive" className="rounded-full text-[10px]">
              {slice.p0VaultMissingCount}/11 vault vars
            </Badge>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          Top blocker: <strong>{slice.topBlockerTitle}</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="default" className="rounded-full">
            <Link href={slice.platformOpsHref}>Inflection matrix</Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="rounded-full">
            <Link href={slice.integrationHealthHref}>Integration health</Link>
          </Button>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.integrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.tier2IntegrityValidateCommand}</p>
        <p className="font-mono text-[10px] text-muted-foreground">{slice.goIntegrityValidateCommand}</p>
      </CardContent>
    </Card>
  );
}
