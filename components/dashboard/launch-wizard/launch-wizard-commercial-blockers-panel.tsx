import Link from "next/link";
import { ArrowRight, ShieldAlert } from "lucide-react";

import { CommercialGoClosurePhasesPanel } from "@/components/dashboard/commercial-go-closure-phases-panel";
import { Month2MarketReadinessPhasesPanel } from "@/components/dashboard/month2-market-readiness-phases-panel";
import { ScaleReadinessPhasesPanel } from "@/components/dashboard/scale-readiness-phases-panel";
import { SeriesAPartnerExpansionPhasesPanel } from "@/components/dashboard/series-a-partner-expansion-phases-panel";
import { MarketLeaderPositioningPhasesPanel } from "@/components/dashboard/market-leader-positioning-phases-panel";
import { SustainedOperationalExcellencePhasesPanel } from "@/components/dashboard/sustained-operational-excellence-phases-panel";
import { PilotWeek1PhasesPanel } from "@/components/dashboard/pilot-week1-phases-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CommercialGoClosureUiSlice } from "@/lib/commercial/commercial-go-closure-ui-era21";
import type { PilotWeek1ExecutionUiSlice } from "@/lib/commercial/pilot-week1-execution-ui-era21";
import type { Month2MarketReadinessUiSlice } from "@/lib/commercial/month2-market-readiness-ui-era21";
import type { ScaleReadinessUiSlice } from "@/lib/commercial/scale-readiness-ui-era21";
import type { SeriesAPartnerExpansionUiSlice } from "@/lib/commercial/series-a-partner-expansion-ui-era21";
import type { MarketLeaderPositioningUiSlice } from "@/lib/commercial/market-leader-positioning-ui-era21";
import { PaidPilotGoConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/paid-pilot-go-convergence-era25-strip";
import { PilotWeek1ExecutionConvergenceEra25Strip } from "@/components/dashboard/launch-wizard/pilot-week1-execution-convergence-era25-strip";
import type { PaidPilotGoConvergenceEra25UiSlice } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import type { PilotWeek1ExecutionConvergenceEra25UiSlice } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import type { LaunchWizardCommercialBlockersSlice } from "@/lib/launch-wizard/launch-wizard-commercial-blockers-era19";
import type { LaunchWizardCommercialSetupSlice } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19";
import { LAUNCH_WIZARD_COMMERCIAL_OPS_CHECKLIST_DOC } from "@/lib/launch-wizard/launch-wizard-commercial-setup-era19-policy";
import { cn } from "@/lib/utils";

export function LaunchWizardCommercialBlockersPanel(props: {
  slice: LaunchWizardCommercialBlockersSlice;
  setup: LaunchWizardCommercialSetupSlice;
  commercialGoClosure?: CommercialGoClosureUiSlice | null;
  pilotWeek1?: PilotWeek1ExecutionUiSlice | null;
  month2MarketReadiness?: Month2MarketReadinessUiSlice | null;
  scaleReadiness?: ScaleReadinessUiSlice | null;
  seriesAPartnerExpansion?: SeriesAPartnerExpansionUiSlice | null;
  marketLeaderPositioning?: MarketLeaderPositioningUiSlice | null;
  sustainedOperationalExcellence?: SustainedOperationalExcellenceUiSlice | null;
  paidPilotGoConvergence?: PaidPilotGoConvergenceEra25UiSlice | null;
  pilotWeek1ExecutionConvergence?: PilotWeek1ExecutionConvergenceEra25UiSlice | null;
  compact?: boolean;
}) {
  const {
    slice,
    setup,
    commercialGoClosure = null,
    pilotWeek1 = null,
    month2MarketReadiness = null,
    scaleReadiness = null,
    seriesAPartnerExpansion = null,
    marketLeaderPositioning = null,
    sustainedOperationalExcellence = null,
    paidPilotGoConvergence = null,
    pilotWeek1ExecutionConvergence = null,
    compact = false,
  } = props;
  const decisionVariant =
    slice.decision === "GO"
      ? "default"
      : slice.decision === "NO-GO"
        ? "destructive"
        : "outline";

  return (
    <Card
      className="border-border/80 shadow-sm"
      data-testid="launch-wizard-commercial-blockers"
      id="launch-wizard-commercial-blockers"
    >
      <CardHeader className={cn("pb-3", compact && "py-3")}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
              Commercial pilot blockers
            </CardTitle>
            {!compact ? (
              <CardDescription className="mt-1 max-w-2xl">{slice.headline}</CardDescription>
            ) : null}
          </div>
          <Badge variant={decisionVariant} className="rounded-full">
            {slice.decisionLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className={cn("space-y-3", compact && "pt-0")}>
        {compact ? (
          <p className="text-sm text-muted-foreground">{slice.headline}</p>
        ) : null}

        {setup.nextUnblock ? (
          <div
            className="rounded-xl border border-amber-200/80 bg-amber-50/30 px-3 py-3 dark:border-amber-900/40 dark:bg-amber-950/15"
            data-testid="launch-wizard-next-commercial-unblock"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next commercial unblock
            </p>
            <p className="mt-1 font-medium">{setup.nextUnblock.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{setup.nextUnblock.detail}</p>
            <Button asChild size="sm" className="mt-3 w-full rounded-full sm:w-auto">
              <Link href={setup.nextUnblock.href}>
                Resolve blocker
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        ) : null}

        {slice.blockers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No commercial blockers surfaced — finish workspace setup steps and confirm cutover checklist.
          </p>
        ) : (
          <ul className="space-y-2">
            {slice.blockers.map((blocker) => (
              <li
                key={blocker.id}
                className={cn(
                  "rounded-xl border px-3 py-2.5",
                  blocker.tone === "urgent"
                    ? "border-amber-200/80 bg-amber-50/30 dark:border-amber-900/40 dark:bg-amber-950/15"
                    : "border-border/70 bg-background/80",
                )}
                data-testid={`launch-wizard-blocker-${blocker.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{blocker.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{blocker.detail}</p>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0 rounded-full">
                    <Link href={blocker.href}>
                      Open
                      <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {!slice.artifactPresent ? (
          <p className="text-xs text-muted-foreground">
            GO/NO-GO artifact missing — run npm run smoke:pilot-gono-go before contract cutover.
          </p>
        ) : null}

        {!compact && setup.recoveryLinks.length > 0 ? (
          <div className="space-y-2 border-t border-border/60 pt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recovery and proof links
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {setup.recoveryLinks.map((link) => (
                <Link
                  key={link.id}
                  href={link.href}
                  data-testid={`launch-wizard-recovery-${link.id}`}
                  className="flex items-start justify-between gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm hover:bg-muted/30"
                >
                  <div>
                    <p className="font-medium">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.detail}</p>
                  </div>
                  <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">
              Ops vault checklist:{" "}
              <span className="font-mono">{LAUNCH_WIZARD_COMMERCIAL_OPS_CHECKLIST_DOC}</span>
            </p>
          </div>
        ) : null}

        {commercialGoClosure ? (
          <CommercialGoClosurePhasesPanel slice={commercialGoClosure} variant="dashboard" />
        ) : null}

        {paidPilotGoConvergence ? (
          <PaidPilotGoConvergenceEra25Strip slice={paidPilotGoConvergence} />
        ) : null}

        {pilotWeek1ExecutionConvergence ? (
          <PilotWeek1ExecutionConvergenceEra25Strip slice={pilotWeek1ExecutionConvergence} />
        ) : null}

        {pilotWeek1 ? (
          <PilotWeek1PhasesPanel slice={pilotWeek1} variant="dashboard" />
        ) : null}

        {month2MarketReadiness ? (
          <Month2MarketReadinessPhasesPanel slice={month2MarketReadiness} variant="dashboard" />
        ) : null}

        {scaleReadiness ? (
          <ScaleReadinessPhasesPanel slice={scaleReadiness} variant="dashboard" />
        ) : null}

        {seriesAPartnerExpansion ? (
          <SeriesAPartnerExpansionPhasesPanel slice={seriesAPartnerExpansion} variant="dashboard" />
        ) : null}

        {marketLeaderPositioning ? (
          <MarketLeaderPositioningPhasesPanel slice={marketLeaderPositioning} variant="dashboard" />
        ) : null}

        {sustainedOperationalExcellence ? (
          <SustainedOperationalExcellencePhasesPanel
            slice={sustainedOperationalExcellence}
            variant="dashboard"
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
