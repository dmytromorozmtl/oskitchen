import Link from "next/link";
import { AlertCircle, CheckCircle2, Circle, Info, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MaintenanceModeRhythmStatusKind } from "@/lib/commercial/maintenance-mode-phases-era24";
import type { MaintenanceModeUiSlice } from "@/lib/commercial/maintenance-mode-ui-era24";
import {
  formatMaintenanceModeProgressLabel,
  MAINTENANCE_MODE_PLATFORM_ANCHOR,
} from "@/lib/commercial/maintenance-mode-ui-era24";
import { formatEngineeringPathTerminusProgressLabel } from "@/lib/commercial/engineering-path-terminus-ui-era24";
import { formatCommercialPilotPathAbsoluteEndLabel } from "@/lib/commercial/commercial-pilot-path-absolute-end-ui-era24";
import { formatLinearPathPermanentlyClosedLabel } from "@/lib/commercial/linear-path-permanently-closed-ui-era24";
import { formatLinearChainTerminusGuardLabel } from "@/lib/commercial/linear-chain-terminus-guard-ui-era24";
import { formatEra25CharterExitLabel } from "@/lib/commercial/era25-charter-exit-ui-era24";
import { formatEra25FirstCharterSliceReadinessLabel } from "@/lib/commercial/era25-first-charter-slice-readiness-ui-era24";
import { formatEra25EngineeringGatesLabel } from "@/lib/commercial/era25-engineering-gates-ui-era24";
import { formatEra25FirstProductSliceBlueprintLabel } from "@/lib/commercial/era25-first-product-slice-blueprint-ui-era24";
import { formatOwnerDailyBriefingBreakthroughEra25Label } from "@/lib/commercial/owner-daily-briefing-breakthrough-ui-era25";
import { formatPaidPilotGoConvergenceEra25Label } from "@/lib/commercial/paid-pilot-go-convergence-ui-era25";
import { formatPilotWeek1ExecutionConvergenceEra25Label } from "@/lib/commercial/pilot-week1-execution-convergence-ui-era25";
import { formatMonth2MarketReadinessConvergenceEra25Label } from "@/lib/commercial/month2-market-readiness-convergence-ui-era25";
import { formatScaleReadinessConvergenceEra25Label } from "@/lib/commercial/scale-readiness-convergence-ui-era25";
import { formatSeriesAPartnerExpansionConvergenceEra25Label } from "@/lib/commercial/series-a-partner-expansion-convergence-ui-era25";
import { formatMarketLeaderPositioningConvergenceEra25Label } from "@/lib/commercial/market-leader-positioning-convergence-ui-era25";
import { formatSustainedOperationalExcellenceConvergenceEra25Label } from "@/lib/commercial/sustained-operational-excellence-convergence-ui-era25";
import { formatPureOperationalModeTerminusEra25Label } from "@/lib/commercial/pure-operational-mode-terminus-ui-era25";
import { formatEra25CommercialPilotConvergenceTrainClosureEra25Label } from "@/lib/commercial/era25-commercial-pilot-convergence-train-closure-ui-era25";
import { formatEra25PostReentrantCharterLockEra25Label } from "@/lib/commercial/era25-post-re-entrant-charter-lock-ui-era25";
import { formatEra25CommercialPilotConvergenceTrainCapstoneEra25Label } from "@/lib/commercial/era25-commercial-pilot-convergence-train-capstone-ui-era25";
import { formatEra25P0MarketProofHonestClosureCapstoneEra25Label } from "@/lib/commercial/era25-p0-market-proof-honest-closure-capstone-ui-era25";
import { formatEra25PostMarketProofSteadyOperationalWitnessEra25Label } from "@/lib/commercial/era25-post-market-proof-steady-operational-witness-ui-era25";
import { formatEra25GovernanceTrainTerminalSealEra25Label } from "@/lib/commercial/era25-governance-train-terminal-seal-ui-era25";
import { formatEra25PostTerminalSealCommercialOpsPermanenceEra25Label } from "@/lib/commercial/era25-post-terminal-seal-commercial-ops-permanence-ui-era25";
import { formatEra25BandAGovernanceChainCapstoneWitnessEra25Label } from "@/lib/commercial/era25-band-a-governance-chain-capstone-witness-ui-era25";
import { formatEra25PostBandAGovernanceSteadyProductModeWitnessEra25Label } from "@/lib/commercial/era25-post-band-a-governance-steady-product-mode-witness-ui-era25";
import { formatEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25Label } from "@/lib/commercial/era25-post-steady-product-mode-commercial-ops-rhythm-permanence-ui-era25";
import { formatEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25Label } from "@/lib/commercial/era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-ui-era25";
import { formatEra25BandAMarketProofExecutionSolePathEra25Label } from "@/lib/commercial/era25-band-a-market-proof-execution-sole-path-ui-era25";
import { formatEra25ConvergenceGovernanceTerminusFreezeEra25Label } from "@/lib/commercial/era25-convergence-governance-terminus-freeze-ui-era25";
import { formatEra25SteadyStateOperatorLoopLockEra25Label } from "@/lib/commercial/era25-steady-state-operator-loop-lock-ui-era25";
import { formatSustainedProductEvolutionReentrantEra25Label } from "@/lib/commercial/sustained-product-evolution-re-entrant-ui-era25";
import { formatPostTerminusSteadyStateProgressLabel } from "@/lib/commercial/post-terminus-steady-state-ui-era24";
import { cn } from "@/lib/utils";
import type { MaintenancePanelContext } from "@/components/dashboard/maintenance/maintenance-mode-shared";

export function MaintenanceEngineeringPathTerminusPanel({ slice, isPlatform, isCompact }: MaintenancePanelContext) {
  if (isCompact || !isPlatform) return null;
  return (
    <>
        {!isCompact && slice.engineeringPathTerminus && isPlatform ? (
          <div
            id="engineering-path-terminus"
            className="scroll-mt-24 rounded-lg border border-dashed border-slate-600/60 px-3 py-3 text-xs"
            data-testid="engineering-path-terminus-panel"
          >
            <p className="font-medium text-slate-100">
              Engineering path terminus — master orchestration (Step 13)
            </p>
            <p className="mt-1 text-slate-400">
              {formatEngineeringPathTerminusProgressLabel(slice.engineeringPathTerminus)} · no era25
              gates without charter
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-slate-200">
                {slice.engineeringPathTerminus.engineeringPathTerminusMilestone.replaceAll("_", " ")}
              </Badge>
              {slice.engineeringPathTerminus.pureOperationalModeEra25Active ? (
                <Badge variant="default" className="rounded-full font-mono text-[10px]">
                  era25 pure ops
                </Badge>
              ) : slice.engineeringPathTerminus.sustainedOpsConvergenceReady ? (
                <Badge variant="secondary" className="rounded-full font-mono text-[10px]">
                  era25 sustained ops
                </Badge>
              ) : null}
              <Badge variant="outline" className="rounded-full text-[10px] text-slate-300">
                gate chain {slice.engineeringPathTerminus.gateStepsComplete ? "complete" : "blocked"}
              </Badge>
              {!slice.engineeringPathTerminus.engineeringPathTerminusIntegrityPassed ? (
                <Badge variant="destructive" className="rounded-full text-[10px]">
                  Engineering terminus blocked
                </Badge>
              ) : null}
              {!slice.engineeringPathTerminus.maintenanceModeIntegrityPassed ? (
                <Badge variant="destructive" className="rounded-full text-[10px]">
                  Maintenance mode integrity FAIL
                </Badge>
              ) : null}
            </div>
            <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto">
              {slice.engineeringPathTerminus.steps.map((step) => (
                <li
                  key={step.id}
                  className={cn(
                    "rounded px-2 py-1",
                    step.complete ? "text-emerald-300/90" : "text-amber-200/90",
                  )}
                >
                  <span className="font-mono text-[10px]">
                    {step.complete ? "✓" : "○"} S{step.step}
                  </span>{" "}
                  {step.label}{" "}
                  <span className="opacity-70">({step.kind})</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>{slice.engineeringPathTerminus.productionPilotReadyClosureExecutionCommand}</span>
              <span>{slice.engineeringPathTerminus.postMaintenanceModeOrchestratorCommand}</span>
              <span>{slice.engineeringPathTerminus.validateCommand}</span>
              <span>{slice.engineeringPathTerminus.syncStatusReportCommand}</span>
              <span>{slice.engineeringPathTerminus.validateMaintenanceModeCommand}</span>
              <span>{slice.engineeringPathTerminus.validateMaintenanceModeIntegrityCommand}</span>
              <span>{slice.engineeringPathTerminus.integrityValidateCommand}</span>
              <span>{slice.engineeringPathTerminus.syncIntegrityBaselineCommand}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button asChild size="sm" variant="ghost" className="rounded-full">
                <Link href={slice.engineeringPathTerminus.pureOperationalModeTerminusHref}>
                  era25 terminus
                </Link>
              </Button>
            </div>
          </div>
        ) : null}
    </>
  );
}
