import Link from "next/link";
import { AlertTriangle, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { LaunchWizardProductionGradeSnapshot } from "@/lib/launch-wizard/launch-wizard-production-grade-era20";
import { LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { LAUNCH_WIZARD_ROUTE } from "@/lib/launch-wizard/launch-wizard-era19-policy";
import { cn } from "@/lib/utils";

export function LaunchWizardProductionGradeBanner(props: {
  snapshot: LaunchWizardProductionGradeSnapshot;
  compact?: boolean;
}) {
  const { snapshot, compact = false } = props;
  const commercialHref = `${LAUNCH_WIZARD_ROUTE}${LAUNCH_WIZARD_COMMERCIAL_BLOCKERS_ANCHOR}`;

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="launch-wizard-production-grade-banner"
    >
      <CardContent className={cn("space-y-3 py-4", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
              Pilot setup status
            </p>
            <p className="text-sm text-muted-foreground">{snapshot.headline}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {snapshot.blockedStepCount > 0 ? (
              <Badge variant="destructive" className="rounded-full tabular-nums">
                {snapshot.blockedStepCount} step blocked
              </Badge>
            ) : null}
            {snapshot.commercialBlockerCount > 0 ? (
              <Badge variant="outline" className="rounded-full tabular-nums">
                {snapshot.commercialBlockerCount} commercial
              </Badge>
            ) : null}
          </div>
        </div>

        {snapshot.p0ProofChip ? (
          <div
            className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-amber-50/30 px-3 py-3 sm:flex-row sm:items-center sm:justify-between dark:border-amber-900/40 dark:bg-amber-950/15"
            data-testid="launch-wizard-p0-proof-chip"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" aria-hidden />
              <div>
                <p className="text-sm font-medium">{snapshot.p0ProofChip.label}</p>
                <p className="text-xs text-muted-foreground">{snapshot.p0ProofChip.detail}</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full shrink-0 rounded-full sm:w-auto">
              <Link href={snapshot.p0ProofChip.href}>View P0 blockers</Link>
            </Button>
          </div>
        ) : null}

        {(snapshot.commercialBlockerCount > 0 || snapshot.blockedStepCount > 0) && !compact ? (
          <Button asChild variant="ghost" size="sm" className="h-auto rounded-full px-0 text-sm">
            <Link href={commercialHref} data-testid="launch-wizard-production-grade-commercial-link">
              Jump to commercial blockers
            </Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
