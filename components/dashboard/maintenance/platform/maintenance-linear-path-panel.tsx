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

export function MaintenanceLinearPathPanel({ slice, isPlatform, isCompact }: MaintenancePanelContext) {
  if (isCompact || !isPlatform) return null;
  return (
    <>
        {!isCompact &&
        slice.engineeringPathTerminus?.postTerminusSteadyState?.absolutePathEnd
          ?.linearPathPermanentlyClosed &&
        isPlatform ? (
          <div
            id="linear-path-permanently-closed"
            className="scroll-mt-24 rounded-lg border border-dashed border-rose-800/50 px-3 py-3 text-xs"
            data-testid="linear-path-permanently-closed-panel"
          >
            <p className="font-medium text-rose-100">
              Linear path permanently closed — doc chain terminus (Step 16)
            </p>
            <p className="mt-1 text-rose-200/80">
              {formatLinearPathPermanentlyClosedLabel(
                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed,
              )}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="rounded-full font-mono text-[10px] text-rose-200">
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.linearPathPermanentlyClosedMilestone.replaceAll(
                  "_",
                  " ",
                )}
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] text-rose-300">
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.docChainSteps
                }
                -step doc chain
              </Badge>
              <Badge variant="outline" className="rounded-full text-[10px] text-rose-300">
                guard{" "}
                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.terminusGuardPassed
                  ? "PASS"
                  : "FAIL"}
              </Badge>
              {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                .linearPathPermanentlyClosed.linearPathPermanentlyClosedIntegrityPassed ? (
                <Badge variant="destructive" className="rounded-full text-[10px]">
                  Linear path blocked
                </Badge>
              ) : null}
              {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                .linearPathPermanentlyClosed.commercialPilotPathAbsoluteEndIntegrityPassed ? (
                <Badge variant="destructive" className="rounded-full text-[10px]">
                  Absolute end integrity FAIL
                </Badge>
              ) : null}
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-400">
              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.forbiddenActions.map(
                (rule) => (
                  <li key={rule}>{rule}</li>
                ),
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.postAbsoluteEndOrchestratorCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.validateCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.syncReportCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.terminusGuardValidateCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed
                    .validateCommercialPilotPathAbsoluteEndIntegrityCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.integrityValidateCommand
                }
              </span>
              <span>
                {
                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.syncIntegrityBaselineCommand
                }
              </span>
            </div>
            <p className="mt-2 text-rose-300/70">
              Step 17 FORBIDDEN · max linear step 16 · missing docs{" "}
              {
                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.missingDocChainDocCount
              }
            </p>

            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
              .linearPathPermanentlyClosed.step17Forbidden ? (
              <div
                id="linear-chain-step17-forbidden"
                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-zinc-700/60 px-3 py-3"
                data-testid="linear-chain-step17-forbidden-panel"
              >
                <p className="font-medium text-zinc-200">
                  Step 17 FORBIDDEN — linear chain terminus guard
                </p>
                <p className="mt-1 text-zinc-400">
                  {formatLinearChainTerminusGuardLabel(
                    slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                      .linearPathPermanentlyClosed.step17Forbidden,
                  )}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="rounded-full font-mono text-[10px] text-zinc-300"
                  >
                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.linearChainTerminusGuardMilestone.replaceAll(
                      "_",
                      " ",
                    )}
                  </Badge>
                  <Badge variant="outline" className="rounded-full text-[10px] text-zinc-400">
                    catalog{" "}
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.catalogStepCount
                    }
                    / max{" "}
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.maxLinearStep
                    }
                  </Badge>
                  {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.step17Forbidden
                    .linearChainTerminusGuardIntegrityPassed ? (
                    <Badge variant="destructive" className="rounded-full text-[10px]">
                      Step 17 guard blocked
                    </Badge>
                  ) : null}
                  {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                    .linearPathPermanentlyClosed.step17Forbidden
                    .linearPathPermanentlyClosedIntegrityPassed ? (
                    <Badge variant="destructive" className="rounded-full text-[10px]">
                      Linear path integrity FAIL
                    </Badge>
                  ) : null}
                </div>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.forbiddenProposals.map(
                    (proposal) => (
                      <li key={proposal}>{proposal}</li>
                    ),
                  )}
                </ul>
                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden
                        .postLinearPathClosedOrchestratorCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.validateCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.syncReportCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.exportEraCharterChecklistCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden
                        .validateLinearPathPermanentlyClosedIntegrityCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.integrityValidateCommand
                    }
                  </span>
                  <span>
                    {
                      slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.syncIntegrityBaselineCommand
                    }
                  </span>
                </div>

                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit ? (
                  <div
                    id="era25-charter-exit-outside-linear-path"
                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                    data-testid="era25-charter-exit-outside-linear-path-panel"
                  >
                    <p className="font-medium text-violet-100">
                      era25+ charter exit — outside linear catalog
                    </p>
                    <p className="mt-1 text-violet-200/80">
                      {formatEra25CharterExitLabel(
                        slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit,
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge
                        variant="outline"
                        className="rounded-full font-mono text-[10px] text-violet-200"
                      >
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.era25CharterExitMilestone.replaceAll(
                          "_",
                          " ",
                        )}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] text-violet-300">
                        checklist{" "}
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .charterChecklistPresent
                          ? "yes"
                          : "no"}
                      </Badge>
                      <Badge variant="outline" className="rounded-full text-[10px] text-violet-300">
                        signed charter{" "}
                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .signedCharterPresent
                          ? "yes"
                          : "no"}
                      </Badge>
                      {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                        .era25CharterExitIntegrityPassed ? (
                        <Badge variant="destructive" className="rounded-full text-[10px]">
                          Charter exit blocked
                        </Badge>
                      ) : null}
                      {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                        .linearChainTerminusGuardIntegrityPassed ? (
                        <Badge variant="destructive" className="rounded-full text-[10px]">
                          Step 17 guard integrity FAIL
                        </Badge>
                      ) : null}
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.humanSteps.map(
                        (step) => (
                          <li key={step}>{step}</li>
                        ),
                      )}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .postTerminusGuardOrchestratorCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.validateCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.syncReportCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .exportCharterChecklistCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .validateLinearChainTerminusGuardIntegrityCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .integrityValidateCommand
                        }
                      </span>
                      <span>
                        {
                          slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .syncIntegrityBaselineCommand
                        }
                      </span>
                    </div>
                    <p className="mt-2 text-violet-300/70">
                      NOT Step 18 · charter template{" "}
                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.charterDocGlobHint}
                    </p>

                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                      .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                      .firstCharterSliceReadiness ? (
                      <div
                        id="era25-first-charter-slice-readiness"
                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-indigo-800/50 px-3 py-3"
                        data-testid="era25-first-charter-slice-readiness-panel"
                      >
                        <p className="font-medium text-indigo-100">
                          era25 first charter slice — section readiness
                        </p>
                        <p className="mt-1 text-indigo-200/80">
                          {formatEra25FirstCharterSliceReadinessLabel(
                            slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness,
                          )}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge
                            variant="outline"
                            className="rounded-full font-mono text-[10px] text-indigo-200"
                          >
                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.era25FirstCharterSliceReadinessMilestone.replaceAll(
                              "_",
                              " ",
                            )}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full text-[10px] text-indigo-300"
                          >
                            sections{" "}
                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness.sectionsValid
                              ? "valid"
                              : "incomplete"}
                          </Badge>
                          {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .firstCharterSliceReadiness.era25FirstCharterSliceIntegrityPassed ? (
                            <Badge variant="destructive" className="rounded-full text-[10px]">
                              First slice blocked
                            </Badge>
                          ) : null}
                          {!slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                            .firstCharterSliceReadiness.era25CharterExitIntegrityPassed ? (
                            <Badge variant="destructive" className="rounded-full text-[10px]">
                              Charter exit integrity FAIL
                            </Badge>
                          ) : null}
                        </div>
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.guardrails.map(
                            (rule) => (
                              <li key={rule}>{rule}</li>
                            ),
                          )}
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.postCharterExitOrchestratorCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.validateCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.syncReportCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.validateEra25CharterExitIntegrityCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.integrityValidateCommand
                            }
                          </span>
                          <span>
                            {
                              slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.syncIntegrityBaselineCommand
                            }
                          </span>
                        </div>
                        <p className="mt-2 text-indigo-300/70">
                          No era25 engineering until{" "}
                          <span className="font-mono">era25_first_charter_slice_ready</span>
                        </p>

                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                          .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                          .firstCharterSliceReadiness?.engineeringGates ? (
                          <div
                            id="era25-engineering-gates-require-signed-charter"
                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                            data-testid="era25-engineering-gates-require-signed-charter-panel"
                          >
                            <p className="font-medium text-violet-100">
                              era25 engineering gates — require signed charter
                            </p>
                            <p className="mt-1 text-violet-200/80">
                              {formatEra25EngineeringGatesLabel(
                                slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates,
                              )}
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge
                                variant="outline"
                                className="rounded-full font-mono text-[10px] text-violet-200"
                              >
                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.era25EngineeringGatesMilestone.replaceAll(
                                  "_",
                                  " ",
                                )}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="rounded-full text-[10px] text-violet-300"
                              >
                                gates{" "}
                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates.gatesBlocked
                                  ? "blocked"
                                  : "open"}
                              </Badge>
                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.engineeringGates
                                .era25EngineeringGatesIntegrityPassed ? null : (
                                <Badge variant="destructive" className="rounded-full text-[10px]">
                                  gates integrity FAIL
                                </Badge>
                              )}
                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                .firstCharterSliceReadiness.engineeringGates
                                .era25FirstCharterSliceIntegrityPassed ? null : (
                                <Badge variant="destructive" className="rounded-full text-[10px]">
                                  first slice integrity FAIL
                                </Badge>
                              )}
                            </div>
                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.guardrails.map(
                                (rule) => (
                                  <li key={rule}>{rule}</li>
                                ),
                              )}
                            </ul>
                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates
                                    .postReadinessOrchestratorCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.validateCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.syncReportCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates
                                    .validateFirstCharterSliceIntegrityCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.integrityValidateCommand
                                }
                              </span>
                              <span>
                                {
                                  slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates
                                    .syncIntegrityBaselineCommand
                                }
                              </span>
                            </div>
                            <p className="mt-2 text-violet-300/70">
                              First era25 product slice only when{" "}
                              <span className="font-mono">era25_engineering_gates_open</span>
                            </p>

                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                              .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                              .firstCharterSliceReadiness.engineeringGates
                              .firstProductSliceBlueprint ? (
                              <div
                                id="era25-first-product-slice-blueprint"
                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-fuchsia-800/50 px-3 py-3"
                                data-testid="era25-first-product-slice-blueprint-panel"
                              >
                                <p className="font-medium text-fuchsia-100">
                                  era25 first product slice — blueprint orchestration
                                </p>
                                <p className="mt-1 text-fuchsia-200/80">
                                  {formatEra25FirstProductSliceBlueprintLabel(
                                    slice.engineeringPathTerminus.postTerminusSteadyState
                                      .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                      .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint,
                                  )}
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  <Badge
                                    variant="outline"
                                    className="rounded-full font-mono text-[10px] text-fuchsia-200"
                                  >
                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.era25FirstProductSliceBlueprintMilestone.replaceAll(
                                      "_",
                                      " ",
                                    )}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="rounded-full text-[10px] text-fuchsia-300"
                                  >
                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                      .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                      .firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint.canonicalSliceName}
                                  </Badge>
                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                    .era25FirstProductSliceBlueprintIntegrityPassed ? null : (
                                    <Badge variant="destructive" className="rounded-full text-[10px]">
                                      blueprint integrity FAIL
                                    </Badge>
                                  )}
                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                    .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                    .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                    .era25EngineeringGatesIntegrityPassed ? null : (
                                    <Badge variant="destructive" className="rounded-full text-[10px]">
                                      gates integrity FAIL
                                    </Badge>
                                  )}
                                </div>
                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.guardrails.map(
                                    (rule) => (
                                      <li key={rule}>{rule}</li>
                                    ),
                                  )}
                                </ul>
                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.postGatesOrchestratorCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.validateCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.syncReportCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.validateEngineeringGatesIntegrityCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.integrityValidateCommand
                                    }
                                  </span>
                                  <span>
                                    {
                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                        .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                        .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                        .firstProductSliceBlueprint.syncIntegrityBaselineCommand
                                    }
                                  </span>
                                </div>
                                <p className="mt-2 text-fuchsia-300/70">
                                  era25 product code only when{" "}
                                  <span className="font-mono">
                                    era25_first_product_slice_blueprint_ready
                                  </span>
                                </p>

                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                  .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                  .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                  ?.ownerDailyBriefingBreakthrough ? (
                                  <div
                                    id="era25-owner-daily-briefing-breakthrough"
                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-pink-800/50 px-3 py-3"
                                    data-testid="era25-owner-daily-briefing-breakthrough-panel"
                                  >
                                    <p className="font-medium text-pink-100">
                                      era25 owner daily briefing breakthrough — product slice
                                    </p>
                                    <p className="mt-1 text-pink-200/80">
                                      {formatOwnerDailyBriefingBreakthroughEra25Label(
                                        slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough,
                                      )}
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <Badge
                                        variant="outline"
                                        className="rounded-full font-mono text-[10px] text-pink-200"
                                      >
                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.ownerDailyBriefingBreakthroughEra25Milestone.replaceAll(
                                          "_",
                                          " ",
                                        )}
                                      </Badge>
                                      <Badge
                                        variant="outline"
                                        className="rounded-full text-[10px] text-pink-300"
                                      >
                                        B{" "}
                                        {slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                          .wiredBriefingTileCount}
                                        /
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .briefingSchemeCount
                                        }
                                      </Badge>
                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                        .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                        .ownerDailyBriefingBreakthrough
                                        .ownerDailyBriefingBreakthroughIntegrityPassed ? null : (
                                        <Badge variant="destructive" className="rounded-full text-[10px]">
                                          breakthrough integrity FAIL
                                        </Badge>
                                      )}
                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                        .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                        .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                        .ownerDailyBriefingBreakthrough
                                        .era25FirstProductSliceBlueprintIntegrityPassed ? null : (
                                        <Badge variant="destructive" className="rounded-full text-[10px]">
                                          blueprint integrity FAIL
                                        </Badge>
                                      )}
                                    </div>
                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.guardrails.map(
                                        (rule) => (
                                          <li key={rule}>{rule}</li>
                                        ),
                                      )}
                                    </ul>
                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .postGatesOrchestratorCommand
                                        }
                                      </span>
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .validateCommand
                                        }
                                      </span>
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .validateBlueprintIntegrityCommand
                                        }
                                      </span>
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .integrityValidateCommand
                                        }
                                      </span>
                                      <span>
                                        {
                                          slice.engineeringPathTerminus.postTerminusSteadyState
                                            .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                            .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                            .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                            .syncIntegrityBaselineCommand
                                        }
                                      </span>
                                    </div>
                                    <p className="mt-2 text-pink-300/70">
                                      WOW pillar ready when{" "}
                                      <span className="font-mono">
                                        owner_daily_briefing_breakthrough_era25_ready
                                      </span>
                                    </p>

                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                      .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                      .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                      ?.paidPilotGoConvergence ? (
                                      <div
                                        id="era25-paid-pilot-go-convergence"
                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-rose-800/50 px-3 py-3"
                                        data-testid="era25-paid-pilot-go-convergence-panel"
                                      >
                                        <p className="font-medium text-rose-100">
                                          era25 paid pilot GO convergence — B3 tile
                                        </p>
                                        <p className="mt-1 text-rose-200/80">
                                          {formatPaidPilotGoConvergenceEra25Label(
                                            slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed
                                              .step17Forbidden.era25CharterExit
                                              .firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint
                                              .ownerDailyBriefingBreakthrough.paidPilotGoConvergence,
                                          )}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                          <Badge
                                            variant="outline"
                                            className="rounded-full font-mono text-[10px] text-rose-200"
                                          >
                                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.paidPilotGoConvergenceEra25Milestone.replaceAll(
                                              "_",
                                              " ",
                                            )}
                                          </Badge>
                                          <Badge
                                            variant="outline"
                                            className="rounded-full text-[10px] text-rose-300"
                                          >
                                            GO:{" "}
                                            {slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed
                                              .step17Forbidden.era25CharterExit
                                              .firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                              .paidPilotGoConvergence.goDecision ?? "NO ARTIFACT"}
                                          </Badge>
                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                            .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                            .paidPilotGoConvergenceIntegrityPassed ? null : (
                                            <Badge variant="destructive" className="rounded-full text-[10px]">
                                              GO convergence integrity FAIL
                                            </Badge>
                                          )}
                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                            .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                            .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                            .ownerDailyBriefingBreakthroughIntegrityPassed ? null : (
                                            <Badge variant="destructive" className="rounded-full text-[10px]">
                                              breakthrough integrity FAIL
                                            </Badge>
                                          )}
                                        </div>
                                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.guardrails.map(
                                            (rule) => (
                                              <li key={rule}>{rule}</li>
                                            ),
                                          )}
                                        </ul>
                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .postBreakthroughOrchestratorCommand
                                            }
                                          </span>
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .validateCommand
                                            }
                                          </span>
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .validateBreakthroughIntegrityCommand
                                            }
                                          </span>
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .integrityValidateCommand
                                            }
                                          </span>
                                          <span>
                                            {
                                              slice.engineeringPathTerminus.postTerminusSteadyState
                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                .step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates
                                                .firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .syncIntegrityBaselineCommand
                                            }
                                          </span>
                                        </div>
                                        <p className="mt-2 text-rose-300/70">
                                          Convergence ready when{" "}
                                          <span className="font-mono">
                                            paid_pilot_go_convergence_era25_ready
                                          </span>
                                        </p>

                                        {slice.engineeringPathTerminus.postTerminusSteadyState
                                          .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                          .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                          .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                          ?.paidPilotGoConvergence?.pilotWeek1ExecutionConvergence ? (
                                          <div
                                            id="era25-pilot-week1-execution-convergence"
                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                                            data-testid="era25-pilot-week1-execution-convergence-panel"
                                          >
                                            <p className="font-medium text-violet-100">
                                              era25 pilot week 1 execution convergence
                                            </p>
                                            <p className="mt-1 text-violet-200/80">
                                              {formatPilotWeek1ExecutionConvergenceEra25Label(
                                                slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint
                                                  .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                  .pilotWeek1ExecutionConvergence,
                                              )}
                                            </p>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                              <Badge
                                                variant="outline"
                                                className="rounded-full font-mono text-[10px] text-violet-200"
                                              >
                                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.pilotWeek1ExecutionConvergenceEra25Milestone.replaceAll(
                                                  "_",
                                                  " ",
                                                )}
                                              </Badge>
                                              <Badge
                                                variant="outline"
                                                className="rounded-full text-[10px] text-violet-300"
                                              >
                                                {slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                  .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                  .completedPhaseCount}
                                                /
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                    .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                    .totalPhaseCount
                                                }{" "}
                                                days
                                              </Badge>
                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .pilotWeek1ExecutionConvergence
                                                .pilotWeek1ExecutionConvergenceIntegrityPassed ? null : (
                                                <Badge variant="destructive" className="rounded-full text-[10px]">
                                                  week 1 integrity FAIL
                                                </Badge>
                                              )}
                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd
                                                .linearPathPermanentlyClosed.step17Forbidden.era25CharterExit
                                                .firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint
                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                .pilotWeek1ExecutionConvergence
                                                .paidPilotGoConvergenceIntegrityPassed ? null : (
                                                <Badge variant="destructive" className="rounded-full text-[10px]">
                                                  GO convergence integrity FAIL
                                                </Badge>
                                              )}
                                            </div>
                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.guardrails.map(
                                                (rule) => (
                                                  <li key={rule}>{rule}</li>
                                                ),
                                              )}
                                            </ul>
                                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence
                                                    .postGoConvergenceOrchestratorCommand
                                                }
                                              </span>
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence.validateCommand
                                                }
                                              </span>
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence.validateGoConvergenceIntegrityCommand
                                                }
                                              </span>
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence.integrityValidateCommand
                                                }
                                              </span>
                                              <span>
                                                {
                                                  slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence.syncIntegrityBaselineCommand
                                                }
                                              </span>
                                            </div>
                                            <p className="mt-2 text-violet-300/70">
                                              Convergence ready when{" "}
                                              <span className="font-mono">
                                                pilot_week1_execution_convergence_era25_ready
                                              </span>
                                            </p>

                                            {slice.engineeringPathTerminus.postTerminusSteadyState
                                              .absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden
                                              .era25CharterExit.firstCharterSliceReadiness.engineeringGates
                                              .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                              .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                              ?.month2MarketReadinessConvergence ? (
                                              <div
                                                id="era25-month2-market-readiness-convergence"
                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-indigo-800/50 px-3 py-3"
                                                data-testid="era25-month2-market-readiness-convergence-panel"
                                              >
                                                <p className="font-medium text-indigo-100">
                                                  era25 month 2 market readiness convergence
                                                </p>
                                                <p className="mt-1 text-indigo-200/80">
                                                  {formatMonth2MarketReadinessConvergenceEra25Label(
                                                    slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint
                                                      .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                      .pilotWeek1ExecutionConvergence
                                                      .month2MarketReadinessConvergence,
                                                  )}
                                                </p>
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                  <Badge
                                                    variant="outline"
                                                    className="rounded-full font-mono text-[10px] text-indigo-200"
                                                  >
                                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.month2MarketReadinessConvergenceEra25Milestone.replaceAll(
                                                      "_",
                                                      " ",
                                                    )}
                                                  </Badge>
                                                  <Badge
                                                    variant="outline"
                                                    className="rounded-full text-[10px] text-indigo-300"
                                                  >
                                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                      .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                      .month2MarketReadinessConvergence
                                                      .completedBlockingCount}
                                                    /
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                        .paidPilotGoConvergence.pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .totalBlockingCount
                                                    }{" "}
                                                    workstreams
                                                  </Badge>
                                                  {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence
                                                    .month2MarketReadinessConvergence
                                                    .month2MarketReadinessConvergenceIntegrityPassed ? (
                                                    <Badge
                                                      variant="destructive"
                                                      className="rounded-full text-[10px]"
                                                    >
                                                      month 2 integrity FAIL
                                                    </Badge>
                                                  ) : null}
                                                  {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                    .step17Forbidden.era25CharterExit
                                                    .firstCharterSliceReadiness.engineeringGates
                                                    .firstProductSliceBlueprint
                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                    .pilotWeek1ExecutionConvergence
                                                    .month2MarketReadinessConvergence
                                                    .pilotWeek1ExecutionConvergenceIntegrityPassed ? (
                                                    <Badge
                                                      variant="destructive"
                                                      className="rounded-full text-[10px]"
                                                    >
                                                      week 1 integrity FAIL
                                                    </Badge>
                                                  ) : null}
                                                </div>
                                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.guardrails.map(
                                                    (rule) => (
                                                      <li key={rule}>{rule}</li>
                                                    ),
                                                  )}
                                                </ul>
                                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .postWeek1ConvergenceOrchestratorCommand
                                                    }
                                                  </span>
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence.validateCommand
                                                    }
                                                  </span>
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .validateWeek1ConvergenceIntegrityCommand
                                                    }
                                                  </span>
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence.integrityValidateCommand
                                                    }
                                                  </span>
                                                  <span>
                                                    {
                                                      slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .syncIntegrityBaselineCommand
                                                    }
                                                  </span>
                                                </div>
                                                <p className="mt-2 text-indigo-300/70">
                                                  Convergence ready when{" "}
                                                  <span className="font-mono">
                                                    month2_market_readiness_convergence_era25_ready
                                                  </span>
                                                </p>

                                                {slice.engineeringPathTerminus.postTerminusSteadyState
                                                  .absolutePathEnd.linearPathPermanentlyClosed
                                                  .step17Forbidden.era25CharterExit
                                                  .firstCharterSliceReadiness.engineeringGates
                                                  .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                  .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                                  ?.month2MarketReadinessConvergence
                                                  ?.scaleReadinessConvergence ? (
                                                  <div
                                                    id="era25-scale-readiness-convergence"
                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-800/50 px-3 py-3"
                                                    data-testid="era25-scale-readiness-convergence-panel"
                                                  >
                                                    <p className="font-medium text-emerald-100">
                                                      era25 scale readiness convergence
                                                    </p>
                                                    <p className="mt-1 text-emerald-200/80">
                                                      {formatScaleReadinessConvergenceEra25Label(
                                                        slice.engineeringPathTerminus
                                                          .postTerminusSteadyState.absolutePathEnd
                                                          .linearPathPermanentlyClosed.step17Forbidden
                                                          .era25CharterExit.firstCharterSliceReadiness
                                                          .engineeringGates.firstProductSliceBlueprint
                                                          .ownerDailyBriefingBreakthrough
                                                          .paidPilotGoConvergence
                                                          .pilotWeek1ExecutionConvergence
                                                          .month2MarketReadinessConvergence
                                                          .scaleReadinessConvergence,
                                                      )}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                      <Badge
                                                        variant="outline"
                                                        className="rounded-full font-mono text-[10px] text-emerald-200"
                                                      >
                                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.scaleReadinessConvergenceEra25Milestone.replaceAll(
                                                          "_",
                                                          " ",
                                                        )}
                                                      </Badge>
                                                      <Badge
                                                        variant="outline"
                                                        className="rounded-full text-[10px] text-emerald-300"
                                                      >
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .completedBlockingCount
                                                        }
                                                        /
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .totalBlockingCount
                                                        }{" "}
                                                        gates
                                                      </Badge>
                                                      {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .scaleReadinessConvergence
                                                        .scaleReadinessConvergenceIntegrityPassed ? (
                                                        <Badge
                                                          variant="destructive"
                                                          className="rounded-full text-[10px]"
                                                        >
                                                          scale integrity FAIL
                                                        </Badge>
                                                      ) : null}
                                                      {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                        .step17Forbidden.era25CharterExit
                                                        .firstCharterSliceReadiness.engineeringGates
                                                        .firstProductSliceBlueprint
                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                        .pilotWeek1ExecutionConvergence
                                                        .month2MarketReadinessConvergence
                                                        .scaleReadinessConvergence
                                                        .month2MarketReadinessConvergenceIntegrityPassed ? (
                                                        <Badge
                                                          variant="destructive"
                                                          className="rounded-full text-[10px]"
                                                        >
                                                          month 2 integrity FAIL
                                                        </Badge>
                                                      ) : null}
                                                    </div>
                                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.guardrails.map(
                                                        (rule) => (
                                                          <li key={rule}>{rule}</li>
                                                        ),
                                                      )}
                                                    </ul>
                                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .postMonth2ConvergenceOrchestratorCommand
                                                        }
                                                      </span>
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough
                                                            .paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence.validateCommand
                                                        }
                                                      </span>
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed.step17Forbidden
                                                            .era25CharterExit.firstCharterSliceReadiness
                                                            .engineeringGates.firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .validateMonth2ConvergenceIntegrityCommand
                                                        }
                                                      </span>
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed.step17Forbidden
                                                            .era25CharterExit.firstCharterSliceReadiness
                                                            .engineeringGates.firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence.integrityValidateCommand
                                                        }
                                                      </span>
                                                      <span>
                                                        {
                                                          slice.engineeringPathTerminus
                                                            .postTerminusSteadyState.absolutePathEnd
                                                            .linearPathPermanentlyClosed.step17Forbidden
                                                            .era25CharterExit.firstCharterSliceReadiness
                                                            .engineeringGates.firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence.syncIntegrityBaselineCommand
                                                        }
                                                      </span>
                                                    </div>
                                                    <p className="mt-2 text-emerald-300/70">
                                                      Convergence ready when{" "}
                                                      <span className="font-mono">
                                                        scale_readiness_convergence_era25_ready
                                                      </span>
                                                    </p>

                                                    {slice.engineeringPathTerminus.postTerminusSteadyState
                                                      .absolutePathEnd.linearPathPermanentlyClosed
                                                      .step17Forbidden.era25CharterExit
                                                      .firstCharterSliceReadiness.engineeringGates
                                                      .firstProductSliceBlueprint.ownerDailyBriefingBreakthrough
                                                      .paidPilotGoConvergence?.pilotWeek1ExecutionConvergence
                                                      ?.month2MarketReadinessConvergence
                                                      ?.scaleReadinessConvergence
                                                      ?.seriesAPartnerExpansionConvergence ? (
                                                      <div
                                                        id="era25-series-a-partner-expansion-convergence"
                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-amber-800/50 px-3 py-3"
                                                        data-testid="era25-series-a-partner-expansion-convergence-panel"
                                                      >
                                                        <p className="font-medium text-amber-100">
                                                          era25 series a partner expansion convergence
                                                        </p>
                                                        <p className="mt-1 text-amber-200/80">
                                                          {formatSeriesAPartnerExpansionConvergenceEra25Label(
                                                            slice.engineeringPathTerminus
                                                              .postTerminusSteadyState.absolutePathEnd
                                                              .linearPathPermanentlyClosed.step17Forbidden
                                                              .era25CharterExit.firstCharterSliceReadiness
                                                              .engineeringGates.firstProductSliceBlueprint
                                                              .ownerDailyBriefingBreakthrough
                                                              .paidPilotGoConvergence
                                                              .pilotWeek1ExecutionConvergence
                                                              .month2MarketReadinessConvergence
                                                              .scaleReadinessConvergence
                                                              .seriesAPartnerExpansionConvergence,
                                                          )}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                          <Badge
                                                            variant="outline"
                                                            className="rounded-full font-mono text-[10px] text-amber-200"
                                                          >
                                                            {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.seriesAPartnerExpansionConvergenceEra25Milestone.replaceAll(
                                                              "_",
                                                              " ",
                                                            )}
                                                          </Badge>
                                                          <Badge
                                                            variant="outline"
                                                            className="rounded-full text-[10px] text-amber-300"
                                                          >
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .completedBlockingCount
                                                            }
                                                            /
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .totalBlockingCount
                                                            }{" "}
                                                            tracks
                                                          </Badge>
                                                          {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                            .absolutePathEnd.linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .seriesAPartnerExpansionConvergence
                                                            .seriesAPartnerExpansionConvergenceIntegrityPassed ? (
                                                            <Badge
                                                              variant="destructive"
                                                              className="rounded-full text-[10px]"
                                                            >
                                                              series a integrity FAIL
                                                            </Badge>
                                                          ) : null}
                                                          {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                            .absolutePathEnd.linearPathPermanentlyClosed
                                                            .step17Forbidden.era25CharterExit
                                                            .firstCharterSliceReadiness.engineeringGates
                                                            .firstProductSliceBlueprint
                                                            .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                            .pilotWeek1ExecutionConvergence
                                                            .month2MarketReadinessConvergence
                                                            .scaleReadinessConvergence
                                                            .seriesAPartnerExpansionConvergence
                                                            .scaleReadinessConvergenceIntegrityPassed ? (
                                                            <Badge
                                                              variant="destructive"
                                                              className="rounded-full text-[10px]"
                                                            >
                                                              scale integrity FAIL
                                                            </Badge>
                                                          ) : null}
                                                        </div>
                                                        <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                          {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.guardrails.map(
                                                            (rule) => (
                                                              <li key={rule}>{rule}</li>
                                                            ),
                                                          )}
                                                        </ul>
                                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .postScaleConvergenceOrchestratorCommand
                                                            }
                                                          </span>
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .validateCommand
                                                            }
                                                          </span>
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .validateScaleConvergenceIntegrityCommand
                                                            }
                                                          </span>
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .integrityValidateCommand
                                                            }
                                                          </span>
                                                          <span>
                                                            {
                                                              slice.engineeringPathTerminus
                                                                .postTerminusSteadyState.absolutePathEnd
                                                                .linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough
                                                                .paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .syncIntegrityBaselineCommand
                                                            }
                                                          </span>
                                                        </div>
                                                        <p className="mt-2 text-amber-300/70">
                                                          Convergence ready when{" "}
                                                          <span className="font-mono">
                                                            series_a_partner_expansion_convergence_era25_ready
                                                          </span>
                                                        </p>
                                                        {slice.engineeringPathTerminus
                                                          .postTerminusSteadyState.absolutePathEnd
                                                          .linearPathPermanentlyClosed
                                                          .step17Forbidden.era25CharterExit
                                                          .firstCharterSliceReadiness.engineeringGates
                                                          .firstProductSliceBlueprint
                                                          .ownerDailyBriefingBreakthrough
                                                          .paidPilotGoConvergence
                                                          ?.pilotWeek1ExecutionConvergence
                                                          ?.month2MarketReadinessConvergence
                                                          ?.scaleReadinessConvergence
                                                          ?.seriesAPartnerExpansionConvergence
                                                          ?.marketLeaderPositioningConvergence ? (
                                                          <div
                                                            id="era25-market-leader-positioning-convergence"
                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-800/50 px-3 py-3"
                                                            data-testid="era25-market-leader-positioning-convergence-panel"
                                                          >
                                                            <p className="font-medium text-violet-100">
                                                              era25 market leader positioning convergence
                                                            </p>
                                                            <p className="mt-1 text-violet-200/80">
                                                              {formatMarketLeaderPositioningConvergenceEra25Label(
                                                                slice.engineeringPathTerminus
                                                                  .postTerminusSteadyState
                                                                  .absolutePathEnd
                                                                  .linearPathPermanentlyClosed
                                                                  .step17Forbidden.era25CharterExit
                                                                  .firstCharterSliceReadiness
                                                                  .engineeringGates
                                                                  .firstProductSliceBlueprint
                                                                  .ownerDailyBriefingBreakthrough
                                                                  .paidPilotGoConvergence
                                                                  .pilotWeek1ExecutionConvergence
                                                                  .month2MarketReadinessConvergence
                                                                  .scaleReadinessConvergence
                                                                  .seriesAPartnerExpansionConvergence
                                                                  .marketLeaderPositioningConvergence,
                                                              )}
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                              <Badge
                                                                variant="outline"
                                                                className="rounded-full font-mono text-[10px] text-violet-200"
                                                              >
                                                                {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.marketLeaderPositioningConvergenceEra25Milestone.replaceAll(
                                                                  "_",
                                                                  " ",
                                                                )}
                                                              </Badge>
                                                              <Badge
                                                                variant="outline"
                                                                className="rounded-full text-[10px] text-violet-300"
                                                              >
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .completedBlockingCount
                                                                }
                                                                /
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .totalBlockingCount
                                                                }{" "}
                                                                pillars
                                                              </Badge>
                                                              {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .marketLeaderPositioningConvergence
                                                                .marketLeaderPositioningConvergenceIntegrityPassed ? (
                                                                <Badge
                                                                  variant="destructive"
                                                                  className="rounded-full text-[10px]"
                                                                >
                                                                  market leader integrity FAIL
                                                                </Badge>
                                                              ) : null}
                                                              {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                .absolutePathEnd.linearPathPermanentlyClosed
                                                                .step17Forbidden.era25CharterExit
                                                                .firstCharterSliceReadiness.engineeringGates
                                                                .firstProductSliceBlueprint
                                                                .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                .pilotWeek1ExecutionConvergence
                                                                .month2MarketReadinessConvergence
                                                                .scaleReadinessConvergence
                                                                .seriesAPartnerExpansionConvergence
                                                                .marketLeaderPositioningConvergence
                                                                .seriesAPartnerExpansionConvergenceIntegrityPassed ? (
                                                                <Badge
                                                                  variant="destructive"
                                                                  className="rounded-full text-[10px]"
                                                                >
                                                                  series a integrity FAIL
                                                                </Badge>
                                                              ) : null}
                                                            </div>
                                                            <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                              {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.guardrails.map(
                                                                (rule) => (
                                                                  <li key={rule}>{rule}</li>
                                                                ),
                                                              )}
                                                            </ul>
                                                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .postSeriesAConvergenceOrchestratorCommand
                                                                }
                                                              </span>
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .validateCommand
                                                                }
                                                              </span>
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .validateSeriesAConvergenceIntegrityCommand
                                                                }
                                                              </span>
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .integrityValidateCommand
                                                                }
                                                              </span>
                                                              <span>
                                                                {
                                                                  slice.engineeringPathTerminus
                                                                    .postTerminusSteadyState
                                                                    .absolutePathEnd
                                                                    .linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness
                                                                    .engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough
                                                                    .paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .syncIntegrityBaselineCommand
                                                                }
                                                              </span>
                                                            </div>
                                                            <p className="mt-2 text-violet-300/70">
                                                              Convergence ready when{" "}
                                                              <span className="font-mono">
                                                                market_leader_positioning_convergence_era25_ready
                                                              </span>
                                                            </p>
                                                            {slice.engineeringPathTerminus
                                                              .postTerminusSteadyState.absolutePathEnd
                                                              .linearPathPermanentlyClosed
                                                              .step17Forbidden.era25CharterExit
                                                              .firstCharterSliceReadiness.engineeringGates
                                                              .firstProductSliceBlueprint
                                                              .ownerDailyBriefingBreakthrough
                                                              .paidPilotGoConvergence
                                                              ?.pilotWeek1ExecutionConvergence
                                                              ?.month2MarketReadinessConvergence
                                                              ?.scaleReadinessConvergence
                                                              ?.seriesAPartnerExpansionConvergence
                                                              ?.marketLeaderPositioningConvergence
                                                              ?.sustainedOperationalExcellenceConvergence ? (
                                                              <div
                                                                id="era25-sustained-operational-excellence-convergence"
                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-800/50 px-3 py-3"
                                                                data-testid="era25-sustained-operational-excellence-convergence-panel"
                                                              >
                                                                <p className="font-medium text-emerald-100">
                                                                  era25 sustained operational excellence convergence
                                                                </p>
                                                                <p className="mt-1 text-emerald-200/80">
                                                                  {formatSustainedOperationalExcellenceConvergenceEra25Label(
                                                                    slice.engineeringPathTerminus
                                                                      .postTerminusSteadyState
                                                                      .absolutePathEnd
                                                                      .linearPathPermanentlyClosed
                                                                      .step17Forbidden.era25CharterExit
                                                                      .firstCharterSliceReadiness
                                                                      .engineeringGates
                                                                      .firstProductSliceBlueprint
                                                                      .ownerDailyBriefingBreakthrough
                                                                      .paidPilotGoConvergence
                                                                      .pilotWeek1ExecutionConvergence
                                                                      .month2MarketReadinessConvergence
                                                                      .scaleReadinessConvergence
                                                                      .seriesAPartnerExpansionConvergence
                                                                      .marketLeaderPositioningConvergence
                                                                      .sustainedOperationalExcellenceConvergence,
                                                                  )}
                                                                </p>
                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="rounded-full font-mono text-[10px] text-emerald-200"
                                                                  >
                                                                    {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.sustainedOperationalExcellenceConvergenceEra25Milestone.replaceAll(
                                                                      "_",
                                                                      " ",
                                                                    )}
                                                                  </Badge>
                                                                  <Badge
                                                                    variant="outline"
                                                                    className="rounded-full text-[10px] text-emerald-300"
                                                                  >
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .completedBlockingCount
                                                                    }
                                                                    /
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .totalBlockingCount
                                                                    }{" "}
                                                                    cadences
                                                                  </Badge>
                                                                  {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness.engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .sustainedOperationalExcellenceConvergence
                                                                    .sustainedOperationalExcellenceConvergenceIntegrityPassed ? (
                                                                    <Badge
                                                                      variant="destructive"
                                                                      className="rounded-full text-[10px]"
                                                                    >
                                                                      sustained ops integrity FAIL
                                                                    </Badge>
                                                                  ) : null}
                                                                  {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                    .absolutePathEnd.linearPathPermanentlyClosed
                                                                    .step17Forbidden.era25CharterExit
                                                                    .firstCharterSliceReadiness.engineeringGates
                                                                    .firstProductSliceBlueprint
                                                                    .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                    .pilotWeek1ExecutionConvergence
                                                                    .month2MarketReadinessConvergence
                                                                    .scaleReadinessConvergence
                                                                    .seriesAPartnerExpansionConvergence
                                                                    .marketLeaderPositioningConvergence
                                                                    .sustainedOperationalExcellenceConvergence
                                                                    .marketLeaderPositioningConvergenceIntegrityPassed ? (
                                                                    <Badge
                                                                      variant="destructive"
                                                                      className="rounded-full text-[10px]"
                                                                    >
                                                                      market leader integrity FAIL
                                                                    </Badge>
                                                                  ) : null}
                                                                </div>
                                                                <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                                  {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.guardrails.map(
                                                                    (rule) => (
                                                                      <li key={rule}>{rule}</li>
                                                                    ),
                                                                  )}
                                                                </ul>
                                                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .postMarketLeaderConvergenceOrchestratorCommand
                                                                    }
                                                                  </span>
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .validateCommand
                                                                    }
                                                                  </span>
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .validateMarketLeaderConvergenceIntegrityCommand
                                                                    }
                                                                  </span>
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .integrityValidateCommand
                                                                    }
                                                                  </span>
                                                                  <span>
                                                                    {
                                                                      slice.engineeringPathTerminus
                                                                        .postTerminusSteadyState
                                                                        .absolutePathEnd
                                                                        .linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness
                                                                        .engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough
                                                                        .paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .syncIntegrityBaselineCommand
                                                                    }
                                                                  </span>
                                                                </div>
                                                                <p className="mt-2 text-emerald-300/70">
                                                                  Convergence ready when{" "}
                                                                  <span className="font-mono">
                                                                    sustained_operational_excellence_convergence_era25_ready
                                                                  </span>
                                                                </p>
                                                                {slice.engineeringPathTerminus
                                                                  .postTerminusSteadyState
                                                                  .absolutePathEnd
                                                                  .linearPathPermanentlyClosed
                                                                  .step17Forbidden.era25CharterExit
                                                                  .firstCharterSliceReadiness
                                                                  .engineeringGates
                                                                  .firstProductSliceBlueprint
                                                                  .ownerDailyBriefingBreakthrough
                                                                  .paidPilotGoConvergence
                                                                  .pilotWeek1ExecutionConvergence
                                                                  .month2MarketReadinessConvergence
                                                                  .scaleReadinessConvergence
                                                                  .seriesAPartnerExpansionConvergence
                                                                  .marketLeaderPositioningConvergence
                                                                  .sustainedOperationalExcellenceConvergence
                                                                  ?.pureOperationalModeTerminus ? (
                                                                  <div
                                                                    id="era25-pure-operational-mode-terminus"
                                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-slate-700/60 px-3 py-3"
                                                                    data-testid="era25-pure-operational-mode-terminus-panel"
                                                                  >
                                                                    <p className="font-medium text-slate-200">
                                                                      era25 pure operational mode terminus
                                                                    </p>
                                                                    <p className="mt-1 text-slate-300/80">
                                                                      {formatPureOperationalModeTerminusEra25Label(
                                                                        slice.engineeringPathTerminus
                                                                          .postTerminusSteadyState
                                                                          .absolutePathEnd
                                                                          .linearPathPermanentlyClosed
                                                                          .step17Forbidden
                                                                          .era25CharterExit
                                                                          .firstCharterSliceReadiness
                                                                          .engineeringGates
                                                                          .firstProductSliceBlueprint
                                                                          .ownerDailyBriefingBreakthrough
                                                                          .paidPilotGoConvergence
                                                                          .pilotWeek1ExecutionConvergence
                                                                          .month2MarketReadinessConvergence
                                                                          .scaleReadinessConvergence
                                                                          .seriesAPartnerExpansionConvergence
                                                                          .marketLeaderPositioningConvergence
                                                                          .sustainedOperationalExcellenceConvergence
                                                                          .pureOperationalModeTerminus,
                                                                      )}
                                                                    </p>
                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                      <Badge
                                                                        variant="outline"
                                                                        className="rounded-full font-mono text-[10px] text-slate-200"
                                                                      >
                                                                        {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.pureOperationalModeTerminus.pureOperationalModeTerminusEra25Milestone.replaceAll(
                                                                          "_",
                                                                          " ",
                                                                        )}
                                                                      </Badge>
                                                                      <Badge
                                                                        variant="outline"
                                                                        className="rounded-full text-[10px] text-slate-300"
                                                                      >
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .healthyCount
                                                                        }
                                                                        /
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus.tracks
                                                                            .length
                                                                        }{" "}
                                                                        tracks fresh
                                                                      </Badge>
                                                                      {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness.engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .pureOperationalModeTerminus
                                                                        .pureOperationalModeTerminusConvergenceIntegrityPassed ? (
                                                                        <Badge
                                                                          variant="destructive"
                                                                          className="rounded-full text-[10px]"
                                                                        >
                                                                          pure ops integrity FAIL
                                                                        </Badge>
                                                                      ) : null}
                                                                      {!slice.engineeringPathTerminus.postTerminusSteadyState
                                                                        .absolutePathEnd.linearPathPermanentlyClosed
                                                                        .step17Forbidden.era25CharterExit
                                                                        .firstCharterSliceReadiness.engineeringGates
                                                                        .firstProductSliceBlueprint
                                                                        .ownerDailyBriefingBreakthrough.paidPilotGoConvergence
                                                                        .pilotWeek1ExecutionConvergence
                                                                        .month2MarketReadinessConvergence
                                                                        .scaleReadinessConvergence
                                                                        .seriesAPartnerExpansionConvergence
                                                                        .marketLeaderPositioningConvergence
                                                                        .sustainedOperationalExcellenceConvergence
                                                                        .pureOperationalModeTerminus
                                                                        .sustainedOperationalExcellenceConvergenceIntegrityPassed ? (
                                                                        <Badge
                                                                          variant="destructive"
                                                                          className="rounded-full text-[10px]"
                                                                        >
                                                                          sustained ops integrity FAIL
                                                                        </Badge>
                                                                      ) : null}
                                                                    </div>
                                                                    <ul className="mt-3 list-disc space-y-1 pl-4 text-slate-500">
                                                                      {slice.engineeringPathTerminus.postTerminusSteadyState.absolutePathEnd.linearPathPermanentlyClosed.step17Forbidden.era25CharterExit.firstCharterSliceReadiness.engineeringGates.firstProductSliceBlueprint.ownerDailyBriefingBreakthrough.paidPilotGoConvergence.pilotWeek1ExecutionConvergence.month2MarketReadinessConvergence.scaleReadinessConvergence.seriesAPartnerExpansionConvergence.marketLeaderPositioningConvergence.sustainedOperationalExcellenceConvergence.pureOperationalModeTerminus.guardrails.map(
                                                                        (rule) => (
                                                                          <li key={rule}>{rule}</li>
                                                                        ),
                                                                      )}
                                                                    </ul>
                                                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .postSustainedOpsConvergenceOrchestratorCommand
                                                                        }
                                                                      </span>
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden
                                                                            .era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .validateCommand
                                                                        }
                                                                      </span>
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden.era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .validateSustainedOpsConvergenceIntegrityCommand
                                                                        }
                                                                      </span>
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden.era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .integrityValidateCommand
                                                                        }
                                                                      </span>
                                                                      <span>
                                                                        {
                                                                          slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden.era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .syncIntegrityBaselineCommand
                                                                        }
                                                                      </span>
                                                                    </div>
                                                                    <p className="mt-2 text-slate-400/70">
                                                                      Terminus active when{" "}
                                                                      <span className="font-mono">
                                                                        pure_operational_mode_era25_active
                                                                      </span>
                                                                    </p>
                                                                    {slice.engineeringPathTerminus
                                                                      .postTerminusSteadyState
                                                                      .absolutePathEnd
                                                                      .linearPathPermanentlyClosed
                                                                      .step17Forbidden.era25CharterExit
                                                                      .firstCharterSliceReadiness
                                                                      .engineeringGates
                                                                      .firstProductSliceBlueprint
                                                                      .ownerDailyBriefingBreakthrough
                                                                      .paidPilotGoConvergence
                                                                      .pilotWeek1ExecutionConvergence
                                                                      .month2MarketReadinessConvergence
                                                                      .scaleReadinessConvergence
                                                                      .seriesAPartnerExpansionConvergence
                                                                      .marketLeaderPositioningConvergence
                                                                      .sustainedOperationalExcellenceConvergence
                                                                      .pureOperationalModeTerminus
                                                                      ?.commercialPilotConvergenceTrainClosure ? (
                                                                      <div
                                                                        id="era25-commercial-pilot-convergence-train-closure"
                                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-amber-700/50 px-3 py-3"
                                                                        data-testid="era25-commercial-pilot-convergence-train-closure-panel"
                                                                      >
                                                                        <p className="font-medium text-amber-100/90">
                                                                          era25 commercial pilot convergence train
                                                                          closure
                                                                        </p>
                                                                        <p className="mt-1 text-slate-300/80">
                                                                          {formatEra25CommercialPilotConvergenceTrainClosureEra25Label(
                                                                            slice.engineeringPathTerminus
                                                                              .postTerminusSteadyState
                                                                              .absolutePathEnd
                                                                              .linearPathPermanentlyClosed
                                                                              .step17Forbidden.era25CharterExit
                                                                              .firstCharterSliceReadiness
                                                                              .engineeringGates
                                                                              .firstProductSliceBlueprint
                                                                              .ownerDailyBriefingBreakthrough
                                                                              .paidPilotGoConvergence
                                                                              .pilotWeek1ExecutionConvergence
                                                                              .month2MarketReadinessConvergence
                                                                              .scaleReadinessConvergence
                                                                              .seriesAPartnerExpansionConvergence
                                                                              .marketLeaderPositioningConvergence
                                                                              .sustainedOperationalExcellenceConvergence
                                                                              .pureOperationalModeTerminus
                                                                              .commercialPilotConvergenceTrainClosure,
                                                                          )}
                                                                        </p>
                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                          <Badge
                                                                            variant="outline"
                                                                            className="rounded-full font-mono text-[10px] text-slate-200"
                                                                          >
                                                                            {
                                                                              slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .convergenceIntegrityBaselinesHonestCount
                                                                            }
                                                                            /
                                                                            {
                                                                              slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .convergenceIntegrityBaselinesTotalCount
                                                                            }{" "}
                                                                            baselines
                                                                          </Badge>
                                                                          {!slice.engineeringPathTerminus
                                                                            .postTerminusSteadyState
                                                                            .absolutePathEnd
                                                                            .linearPathPermanentlyClosed
                                                                            .step17Forbidden.era25CharterExit
                                                                            .firstCharterSliceReadiness
                                                                            .engineeringGates
                                                                            .firstProductSliceBlueprint
                                                                            .ownerDailyBriefingBreakthrough
                                                                            .paidPilotGoConvergence
                                                                            .pilotWeek1ExecutionConvergence
                                                                            .month2MarketReadinessConvergence
                                                                            .scaleReadinessConvergence
                                                                            .seriesAPartnerExpansionConvergence
                                                                            .marketLeaderPositioningConvergence
                                                                            .sustainedOperationalExcellenceConvergence
                                                                            .pureOperationalModeTerminus
                                                                            .commercialPilotConvergenceTrainClosure
                                                                            .era25CommercialPilotConvergenceTrainClosureIntegrityPassed ? (
                                                                            <Badge
                                                                              variant="destructive"
                                                                              className="rounded-full text-[10px]"
                                                                            >
                                                                              train closure integrity FAIL
                                                                            </Badge>
                                                                          ) : null}
                                                                        </div>
                                                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                          <span>
                                                                            {
                                                                              slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .integrityValidateCommand
                                                                            }
                                                                          </span>
                                                                          <span>
                                                                            {
                                                                              slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .commercialPilotRunbookCertCommand
                                                                            }
                                                                          </span>
                                                                          <span>
                                                                            {
                                                                              slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .syncIntegrityBaselineCommand
                                                                            }
                                                                          </span>
                                                                        </div>
                                                                        {slice.engineeringPathTerminus
                                                                          .postTerminusSteadyState
                                                                          .absolutePathEnd
                                                                          .linearPathPermanentlyClosed
                                                                          .step17Forbidden
                                                                          .era25CharterExit
                                                                          .firstCharterSliceReadiness
                                                                          .engineeringGates
                                                                          .firstProductSliceBlueprint
                                                                          .ownerDailyBriefingBreakthrough
                                                                          .paidPilotGoConvergence
                                                                          .pilotWeek1ExecutionConvergence
                                                                          .month2MarketReadinessConvergence
                                                                          .scaleReadinessConvergence
                                                                          .seriesAPartnerExpansionConvergence
                                                                          .marketLeaderPositioningConvergence
                                                                          .sustainedOperationalExcellenceConvergence
                                                                          .pureOperationalModeTerminus
                                                                          .commercialPilotConvergenceTrainClosure
                                                                          ?.sustainedProductEvolutionReentrant ? (
                                                                          <div
                                                                            id="sustained-product-evolution-re-entrant"
                                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-700/50 px-3 py-3"
                                                                            data-testid="sustained-product-evolution-re-entrant-panel"
                                                                          >
                                                                            <p className="font-medium text-emerald-100/90">
                                                                              sustained product evolution re-entrant
                                                                            </p>
                                                                            <p className="mt-1 text-slate-300/80">
                                                                              {formatSustainedProductEvolutionReentrantEra25Label(
                                                                                slice.engineeringPathTerminus
                                                                                  .postTerminusSteadyState
                                                                                  .absolutePathEnd
                                                                                  .linearPathPermanentlyClosed
                                                                                  .step17Forbidden
                                                                                  .era25CharterExit
                                                                                  .firstCharterSliceReadiness
                                                                                  .engineeringGates
                                                                                  .firstProductSliceBlueprint
                                                                                  .ownerDailyBriefingBreakthrough
                                                                                  .paidPilotGoConvergence
                                                                                  .pilotWeek1ExecutionConvergence
                                                                                  .month2MarketReadinessConvergence
                                                                                  .scaleReadinessConvergence
                                                                                  .seriesAPartnerExpansionConvergence
                                                                                  .marketLeaderPositioningConvergence
                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                  .pureOperationalModeTerminus
                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                  .sustainedProductEvolutionReentrant,
                                                                              )}
                                                                            </p>
                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                              {!slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .sustainedProductEvolutionReentrant
                                                                                .improvementLoopActive ? (
                                                                                <Badge
                                                                                  variant="outline"
                                                                                  className="rounded-full text-[10px] text-slate-200"
                                                                                >
                                                                                  improvement loop inactive
                                                                                </Badge>
                                                                              ) : null}
                                                                              {slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .sustainedProductEvolutionReentrant
                                                                                .linearConvergenceSurfaceReopened ? (
                                                                                <Badge
                                                                                  variant="destructive"
                                                                                  className="rounded-full text-[10px]"
                                                                                >
                                                                                  linear convergence reopened
                                                                                </Badge>
                                                                              ) : null}
                                                                              {!slice.engineeringPathTerminus
                                                                                .postTerminusSteadyState
                                                                                .absolutePathEnd
                                                                                .linearPathPermanentlyClosed
                                                                                .step17Forbidden
                                                                                .era25CharterExit
                                                                                .firstCharterSliceReadiness
                                                                                .engineeringGates
                                                                                .firstProductSliceBlueprint
                                                                                .ownerDailyBriefingBreakthrough
                                                                                .paidPilotGoConvergence
                                                                                .pilotWeek1ExecutionConvergence
                                                                                .month2MarketReadinessConvergence
                                                                                .scaleReadinessConvergence
                                                                                .seriesAPartnerExpansionConvergence
                                                                                .marketLeaderPositioningConvergence
                                                                                .sustainedOperationalExcellenceConvergence
                                                                                .pureOperationalModeTerminus
                                                                                .commercialPilotConvergenceTrainClosure
                                                                                .sustainedProductEvolutionReentrant
                                                                                .sustainedProductEvolutionReentrantIntegrityPassed ? (
                                                                                <Badge
                                                                                  variant="destructive"
                                                                                  className="rounded-full text-[10px]"
                                                                                >
                                                                                  re-entrant integrity FAIL
                                                                                </Badge>
                                                                              ) : null}
                                                                            </div>
                                                                            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                              <span>
                                                                                {
                                                                                  slice.engineeringPathTerminus
                                                                                    .postTerminusSteadyState
                                                                                    .absolutePathEnd
                                                                                    .linearPathPermanentlyClosed
                                                                                    .step17Forbidden
                                                                                    .era25CharterExit
                                                                                    .firstCharterSliceReadiness
                                                                                    .engineeringGates
                                                                                    .firstProductSliceBlueprint
                                                                                    .ownerDailyBriefingBreakthrough
                                                                                    .paidPilotGoConvergence
                                                                                    .pilotWeek1ExecutionConvergence
                                                                                    .month2MarketReadinessConvergence
                                                                                    .scaleReadinessConvergence
                                                                                    .seriesAPartnerExpansionConvergence
                                                                                    .marketLeaderPositioningConvergence
                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                    .pureOperationalModeTerminus
                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                    .sustainedProductEvolutionReentrant
                                                                                    .integrityValidateCommand
                                                                                }
                                                                              </span>
                                                                              <span>
                                                                                {
                                                                                  slice.engineeringPathTerminus
                                                                                    .postTerminusSteadyState
                                                                                    .absolutePathEnd
                                                                                    .linearPathPermanentlyClosed
                                                                                    .step17Forbidden
                                                                                    .era25CharterExit
                                                                                    .firstCharterSliceReadiness
                                                                                    .engineeringGates
                                                                                    .firstProductSliceBlueprint
                                                                                    .ownerDailyBriefingBreakthrough
                                                                                    .paidPilotGoConvergence
                                                                                    .pilotWeek1ExecutionConvergence
                                                                                    .month2MarketReadinessConvergence
                                                                                    .scaleReadinessConvergence
                                                                                    .seriesAPartnerExpansionConvergence
                                                                                    .marketLeaderPositioningConvergence
                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                    .pureOperationalModeTerminus
                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                    .sustainedProductEvolutionReentrant
                                                                                    .postImprovementLoopOrchestratorCommand
                                                                                }
                                                                              </span>
                                                                              <span>
                                                                                {
                                                                                  slice.engineeringPathTerminus
                                                                                    .postTerminusSteadyState
                                                                                    .absolutePathEnd
                                                                                    .linearPathPermanentlyClosed
                                                                                    .step17Forbidden
                                                                                    .era25CharterExit
                                                                                    .firstCharterSliceReadiness
                                                                                    .engineeringGates
                                                                                    .firstProductSliceBlueprint
                                                                                    .ownerDailyBriefingBreakthrough
                                                                                    .paidPilotGoConvergence
                                                                                    .pilotWeek1ExecutionConvergence
                                                                                    .month2MarketReadinessConvergence
                                                                                    .scaleReadinessConvergence
                                                                                    .seriesAPartnerExpansionConvergence
                                                                                    .marketLeaderPositioningConvergence
                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                    .pureOperationalModeTerminus
                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                    .sustainedProductEvolutionReentrant
                                                                                    .syncIntegrityBaselineCommand
                                                                                }
                                                                              </span>
                                                                            </div>
                                                                            {slice.engineeringPathTerminus
                                                                              .postTerminusSteadyState
                                                                              .absolutePathEnd
                                                                              .linearPathPermanentlyClosed
                                                                              .step17Forbidden
                                                                              .era25CharterExit
                                                                              .firstCharterSliceReadiness
                                                                              .engineeringGates
                                                                              .firstProductSliceBlueprint
                                                                              .ownerDailyBriefingBreakthrough
                                                                              .paidPilotGoConvergence
                                                                              .pilotWeek1ExecutionConvergence
                                                                              .month2MarketReadinessConvergence
                                                                              .scaleReadinessConvergence
                                                                              .seriesAPartnerExpansionConvergence
                                                                              .marketLeaderPositioningConvergence
                                                                              .sustainedOperationalExcellenceConvergence
                                                                              .pureOperationalModeTerminus
                                                                              .commercialPilotConvergenceTrainClosure
                                                                              .sustainedProductEvolutionReentrant
                                                                              ?.era25PostReentrantCharterLock ? (
                                                                              <div
                                                                                id="era25-post-re-entrant-charter-lock"
                                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-slate-600/50 px-3 py-3"
                                                                                data-testid="era25-post-re-entrant-charter-lock-panel"
                                                                              >
                                                                                <p className="font-medium text-slate-100/90">
                                                                                  era25 post-re-entrant charter lock
                                                                                </p>
                                                                                <p className="mt-1 text-slate-300/80">
                                                                                  {formatEra25PostReentrantCharterLockEra25Label(
                                                                                    slice.engineeringPathTerminus
                                                                                      .postTerminusSteadyState
                                                                                      .absolutePathEnd
                                                                                      .linearPathPermanentlyClosed
                                                                                      .step17Forbidden
                                                                                      .era25CharterExit
                                                                                      .firstCharterSliceReadiness
                                                                                      .engineeringGates
                                                                                      .firstProductSliceBlueprint
                                                                                      .ownerDailyBriefingBreakthrough
                                                                                      .paidPilotGoConvergence
                                                                                      .pilotWeek1ExecutionConvergence
                                                                                      .month2MarketReadinessConvergence
                                                                                      .scaleReadinessConvergence
                                                                                      .seriesAPartnerExpansionConvergence
                                                                                      .marketLeaderPositioningConvergence
                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                      .pureOperationalModeTerminus
                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                      .sustainedProductEvolutionReentrant
                                                                                      .era25PostReentrantCharterLock,
                                                                                  )}
                                                                                </p>
                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                  {slice.engineeringPathTerminus
                                                                                    .postTerminusSteadyState
                                                                                    .absolutePathEnd
                                                                                    .linearPathPermanentlyClosed
                                                                                    .step17Forbidden
                                                                                    .era25CharterExit
                                                                                    .firstCharterSliceReadiness
                                                                                    .engineeringGates
                                                                                    .firstProductSliceBlueprint
                                                                                    .ownerDailyBriefingBreakthrough
                                                                                    .paidPilotGoConvergence
                                                                                    .pilotWeek1ExecutionConvergence
                                                                                    .month2MarketReadinessConvergence
                                                                                    .scaleReadinessConvergence
                                                                                    .seriesAPartnerExpansionConvergence
                                                                                    .marketLeaderPositioningConvergence
                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                    .pureOperationalModeTerminus
                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                    .sustainedProductEvolutionReentrant
                                                                                    .era25PostReentrantCharterLock
                                                                                    .frozenEnvMutationDetected ? (
                                                                                    <Badge
                                                                                      variant="destructive"
                                                                                      className="rounded-full text-[10px]"
                                                                                    >
                                                                                      frozen env mutation
                                                                                    </Badge>
                                                                                  ) : null}
                                                                                  {!slice.engineeringPathTerminus
                                                                                    .postTerminusSteadyState
                                                                                    .absolutePathEnd
                                                                                    .linearPathPermanentlyClosed
                                                                                    .step17Forbidden
                                                                                    .era25CharterExit
                                                                                    .firstCharterSliceReadiness
                                                                                    .engineeringGates
                                                                                    .firstProductSliceBlueprint
                                                                                    .ownerDailyBriefingBreakthrough
                                                                                    .paidPilotGoConvergence
                                                                                    .pilotWeek1ExecutionConvergence
                                                                                    .month2MarketReadinessConvergence
                                                                                    .scaleReadinessConvergence
                                                                                    .seriesAPartnerExpansionConvergence
                                                                                    .marketLeaderPositioningConvergence
                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                    .pureOperationalModeTerminus
                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                    .sustainedProductEvolutionReentrant
                                                                                    .era25PostReentrantCharterLock
                                                                                    .era25PostReentrantCharterLockIntegrityPassed ? (
                                                                                    <Badge
                                                                                      variant="destructive"
                                                                                      className="rounded-full text-[10px]"
                                                                                    >
                                                                                      charter lock integrity FAIL
                                                                                    </Badge>
                                                                                  ) : null}
                                                                                </div>
                                                                                <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                                  <span>
                                                                                    {
                                                                                      slice.engineeringPathTerminus
                                                                                        .postTerminusSteadyState
                                                                                        .absolutePathEnd
                                                                                        .linearPathPermanentlyClosed
                                                                                        .step17Forbidden
                                                                                        .era25CharterExit
                                                                                        .firstCharterSliceReadiness
                                                                                        .engineeringGates
                                                                                        .firstProductSliceBlueprint
                                                                                        .ownerDailyBriefingBreakthrough
                                                                                        .paidPilotGoConvergence
                                                                                        .pilotWeek1ExecutionConvergence
                                                                                        .month2MarketReadinessConvergence
                                                                                        .scaleReadinessConvergence
                                                                                        .seriesAPartnerExpansionConvergence
                                                                                        .marketLeaderPositioningConvergence
                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                        .pureOperationalModeTerminus
                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                        .sustainedProductEvolutionReentrant
                                                                                        .era25PostReentrantCharterLock
                                                                                        .integrityValidateCommand
                                                                                    }
                                                                                  </span>
                                                                                  <span>
                                                                                    {
                                                                                      slice.engineeringPathTerminus
                                                                                        .postTerminusSteadyState
                                                                                        .absolutePathEnd
                                                                                        .linearPathPermanentlyClosed
                                                                                        .step17Forbidden
                                                                                        .era25CharterExit
                                                                                        .firstCharterSliceReadiness
                                                                                        .engineeringGates
                                                                                        .firstProductSliceBlueprint
                                                                                        .ownerDailyBriefingBreakthrough
                                                                                        .paidPilotGoConvergence
                                                                                        .pilotWeek1ExecutionConvergence
                                                                                        .month2MarketReadinessConvergence
                                                                                        .scaleReadinessConvergence
                                                                                        .seriesAPartnerExpansionConvergence
                                                                                        .marketLeaderPositioningConvergence
                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                        .pureOperationalModeTerminus
                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                        .sustainedProductEvolutionReentrant
                                                                                        .era25PostReentrantCharterLock
                                                                                        .governanceBundlesCertCommand
                                                                                    }
                                                                                  </span>
                                                                                </div>
                                                                                {slice.engineeringPathTerminus
                                                                                  .postTerminusSteadyState
                                                                                  .absolutePathEnd
                                                                                  .linearPathPermanentlyClosed
                                                                                  .step17Forbidden
                                                                                  .era25CharterExit
                                                                                  .firstCharterSliceReadiness
                                                                                  .engineeringGates
                                                                                  .firstProductSliceBlueprint
                                                                                  .ownerDailyBriefingBreakthrough
                                                                                  .paidPilotGoConvergence
                                                                                  .pilotWeek1ExecutionConvergence
                                                                                  .month2MarketReadinessConvergence
                                                                                  .scaleReadinessConvergence
                                                                                  .seriesAPartnerExpansionConvergence
                                                                                  .marketLeaderPositioningConvergence
                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                  .pureOperationalModeTerminus
                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                  .sustainedProductEvolutionReentrant
                                                                                  .era25PostReentrantCharterLock
                                                                                  ?.era25SteadyStateOperatorLoopLock ? (
                                                                                  <div
                                                                                    id="era25-steady-state-operator-loop-lock"
                                                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-indigo-700/40 px-3 py-3"
                                                                                    data-testid="era25-steady-state-operator-loop-lock-panel"
                                                                                  >
                                                                                    <p className="font-medium text-indigo-100/90">
                                                                                      era25 steady-state operator loop lock
                                                                                    </p>
                                                                                    <p className="mt-1 text-slate-300/80">
                                                                                      {formatEra25SteadyStateOperatorLoopLockEra25Label(
                                                                                        slice.engineeringPathTerminus
                                                                                          .postTerminusSteadyState
                                                                                          .absolutePathEnd
                                                                                          .linearPathPermanentlyClosed
                                                                                          .step17Forbidden
                                                                                          .era25CharterExit
                                                                                          .firstCharterSliceReadiness
                                                                                          .engineeringGates
                                                                                          .firstProductSliceBlueprint
                                                                                          .ownerDailyBriefingBreakthrough
                                                                                          .paidPilotGoConvergence
                                                                                          .pilotWeek1ExecutionConvergence
                                                                                          .month2MarketReadinessConvergence
                                                                                          .scaleReadinessConvergence
                                                                                          .seriesAPartnerExpansionConvergence
                                                                                          .marketLeaderPositioningConvergence
                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                          .pureOperationalModeTerminus
                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                          .sustainedProductEvolutionReentrant
                                                                                          .era25PostReentrantCharterLock
                                                                                          .era25SteadyStateOperatorLoopLock,
                                                                                      )}
                                                                                    </p>
                                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                                      {!slice.engineeringPathTerminus
                                                                                        .postTerminusSteadyState
                                                                                        .absolutePathEnd
                                                                                        .linearPathPermanentlyClosed
                                                                                        .step17Forbidden
                                                                                        .era25CharterExit
                                                                                        .firstCharterSliceReadiness
                                                                                        .engineeringGates
                                                                                        .firstProductSliceBlueprint
                                                                                        .ownerDailyBriefingBreakthrough
                                                                                        .paidPilotGoConvergence
                                                                                        .pilotWeek1ExecutionConvergence
                                                                                        .month2MarketReadinessConvergence
                                                                                        .scaleReadinessConvergence
                                                                                        .seriesAPartnerExpansionConvergence
                                                                                        .marketLeaderPositioningConvergence
                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                        .pureOperationalModeTerminus
                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                        .sustainedProductEvolutionReentrant
                                                                                        .era25PostReentrantCharterLock
                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                        .improvementLoopRhythmMutationDetected ? (
                                                                                        <Badge
                                                                                          variant="destructive"
                                                                                          className="rounded-full text-[10px]"
                                                                                        >
                                                                                          loop rhythm mutation
                                                                                        </Badge>
                                                                                      ) : null}
                                                                                      {!slice.engineeringPathTerminus
                                                                                        .postTerminusSteadyState
                                                                                        .absolutePathEnd
                                                                                        .linearPathPermanentlyClosed
                                                                                        .step17Forbidden
                                                                                        .era25CharterExit
                                                                                        .firstCharterSliceReadiness
                                                                                        .engineeringGates
                                                                                        .firstProductSliceBlueprint
                                                                                        .ownerDailyBriefingBreakthrough
                                                                                        .paidPilotGoConvergence
                                                                                        .pilotWeek1ExecutionConvergence
                                                                                        .month2MarketReadinessConvergence
                                                                                        .scaleReadinessConvergence
                                                                                        .seriesAPartnerExpansionConvergence
                                                                                        .marketLeaderPositioningConvergence
                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                        .pureOperationalModeTerminus
                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                        .sustainedProductEvolutionReentrant
                                                                                        .era25PostReentrantCharterLock
                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                        .era25SteadyStateOperatorLoopLockIntegrityPassed ? (
                                                                                        <Badge
                                                                                          variant="destructive"
                                                                                          className="rounded-full text-[10px]"
                                                                                        >
                                                                                          steady-state integrity FAIL
                                                                                        </Badge>
                                                                                      ) : null}
                                                                                    </div>
                                                                                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                                      <span>
                                                                                        {
                                                                                          slice.engineeringPathTerminus
                                                                                            .postTerminusSteadyState
                                                                                            .absolutePathEnd
                                                                                            .linearPathPermanentlyClosed
                                                                                            .step17Forbidden
                                                                                            .era25CharterExit
                                                                                            .firstCharterSliceReadiness
                                                                                            .engineeringGates
                                                                                            .firstProductSliceBlueprint
                                                                                            .ownerDailyBriefingBreakthrough
                                                                                            .paidPilotGoConvergence
                                                                                            .pilotWeek1ExecutionConvergence
                                                                                            .month2MarketReadinessConvergence
                                                                                            .scaleReadinessConvergence
                                                                                            .seriesAPartnerExpansionConvergence
                                                                                            .marketLeaderPositioningConvergence
                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                            .pureOperationalModeTerminus
                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                            .sustainedProductEvolutionReentrant
                                                                                            .era25PostReentrantCharterLock
                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                            .integrityValidateCommand
                                                                                        }
                                                                                      </span>
                                                                                      <span>
                                                                                        {
                                                                                          slice.engineeringPathTerminus
                                                                                            .postTerminusSteadyState
                                                                                            .absolutePathEnd
                                                                                            .linearPathPermanentlyClosed
                                                                                            .step17Forbidden
                                                                                            .era25CharterExit
                                                                                            .firstCharterSliceReadiness
                                                                                            .engineeringGates
                                                                                            .firstProductSliceBlueprint
                                                                                            .ownerDailyBriefingBreakthrough
                                                                                            .paidPilotGoConvergence
                                                                                            .pilotWeek1ExecutionConvergence
                                                                                            .month2MarketReadinessConvergence
                                                                                            .scaleReadinessConvergence
                                                                                            .seriesAPartnerExpansionConvergence
                                                                                            .marketLeaderPositioningConvergence
                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                            .pureOperationalModeTerminus
                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                            .sustainedProductEvolutionReentrant
                                                                                            .era25PostReentrantCharterLock
                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                            .commercialPilotRunbookCertCommand
                                                                                        }
                                                                                      </span>
                                                                                    </div>
                                                                                    {slice.engineeringPathTerminus
                                                                                      .postTerminusSteadyState
                                                                                      .absolutePathEnd
                                                                                      .linearPathPermanentlyClosed
                                                                                      .step17Forbidden
                                                                                      .era25CharterExit
                                                                                      .firstCharterSliceReadiness
                                                                                      .engineeringGates
                                                                                      .firstProductSliceBlueprint
                                                                                      .ownerDailyBriefingBreakthrough
                                                                                      .paidPilotGoConvergence
                                                                                      .pilotWeek1ExecutionConvergence
                                                                                      .month2MarketReadinessConvergence
                                                                                      .scaleReadinessConvergence
                                                                                      .seriesAPartnerExpansionConvergence
                                                                                      .marketLeaderPositioningConvergence
                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                      .pureOperationalModeTerminus
                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                      .sustainedProductEvolutionReentrant
                                                                                      .era25PostReentrantCharterLock
                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                      ?.era25CommercialPilotConvergenceTrainCapstone ? (
                                                                                      <div
                                                                                        id="era25-commercial-pilot-convergence-train-capstone"
                                                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-700/40 px-3 py-3"
                                                                                        data-testid="era25-commercial-pilot-convergence-train-capstone-panel"
                                                                                      >
                                                                                        <p className="font-medium text-violet-100/90">
                                                                                          era25 commercial pilot convergence train capstone
                                                                                        </p>
                                                                                        <p className="mt-1 text-slate-300/80">
                                                                                          {formatEra25CommercialPilotConvergenceTrainCapstoneEra25Label(
                                                                                            slice.engineeringPathTerminus
                                                                                              .postTerminusSteadyState
                                                                                              .absolutePathEnd
                                                                                              .linearPathPermanentlyClosed
                                                                                              .step17Forbidden
                                                                                              .era25CharterExit
                                                                                              .firstCharterSliceReadiness
                                                                                              .engineeringGates
                                                                                              .firstProductSliceBlueprint
                                                                                              .ownerDailyBriefingBreakthrough
                                                                                              .paidPilotGoConvergence
                                                                                              .pilotWeek1ExecutionConvergence
                                                                                              .month2MarketReadinessConvergence
                                                                                              .scaleReadinessConvergence
                                                                                              .seriesAPartnerExpansionConvergence
                                                                                              .marketLeaderPositioningConvergence
                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                              .pureOperationalModeTerminus
                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                              .sustainedProductEvolutionReentrant
                                                                                              .era25PostReentrantCharterLock
                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                              .era25CommercialPilotConvergenceTrainCapstone,
                                                                                          )}
                                                                                        </p>
                                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                                          {!slice.engineeringPathTerminus
                                                                                            .postTerminusSteadyState
                                                                                            .absolutePathEnd
                                                                                            .linearPathPermanentlyClosed
                                                                                            .step17Forbidden
                                                                                            .era25CharterExit
                                                                                            .firstCharterSliceReadiness
                                                                                            .engineeringGates
                                                                                            .firstProductSliceBlueprint
                                                                                            .ownerDailyBriefingBreakthrough
                                                                                            .paidPilotGoConvergence
                                                                                            .pilotWeek1ExecutionConvergence
                                                                                            .month2MarketReadinessConvergence
                                                                                            .scaleReadinessConvergence
                                                                                            .seriesAPartnerExpansionConvergence
                                                                                            .marketLeaderPositioningConvergence
                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                            .pureOperationalModeTerminus
                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                            .sustainedProductEvolutionReentrant
                                                                                            .era25PostReentrantCharterLock
                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                            .era25CommercialPilotConvergenceTrainCapstoneIntegrityPassed ? (
                                                                                            <Badge
                                                                                              variant="destructive"
                                                                                              className="rounded-full text-[10px]"
                                                                                            >
                                                                                              capstone integrity FAIL
                                                                                            </Badge>
                                                                                          ) : null}
                                                                                          {slice.engineeringPathTerminus
                                                                                            .postTerminusSteadyState
                                                                                            .absolutePathEnd
                                                                                            .linearPathPermanentlyClosed
                                                                                            .step17Forbidden
                                                                                            .era25CharterExit
                                                                                            .firstCharterSliceReadiness
                                                                                            .engineeringGates
                                                                                            .firstProductSliceBlueprint
                                                                                            .ownerDailyBriefingBreakthrough
                                                                                            .paidPilotGoConvergence
                                                                                            .pilotWeek1ExecutionConvergence
                                                                                            .month2MarketReadinessConvergence
                                                                                            .scaleReadinessConvergence
                                                                                            .seriesAPartnerExpansionConvergence
                                                                                            .marketLeaderPositioningConvergence
                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                            .pureOperationalModeTerminus
                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                            .sustainedProductEvolutionReentrant
                                                                                            .era25PostReentrantCharterLock
                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                            .p0ProofReferencedInCapstone &&
                                                                                          slice.engineeringPathTerminus
                                                                                            .postTerminusSteadyState
                                                                                            .absolutePathEnd
                                                                                            .linearPathPermanentlyClosed
                                                                                            .step17Forbidden
                                                                                            .era25CharterExit
                                                                                            .firstCharterSliceReadiness
                                                                                            .engineeringGates
                                                                                            .firstProductSliceBlueprint
                                                                                            .ownerDailyBriefingBreakthrough
                                                                                            .paidPilotGoConvergence
                                                                                            .pilotWeek1ExecutionConvergence
                                                                                            .month2MarketReadinessConvergence
                                                                                            .scaleReadinessConvergence
                                                                                            .seriesAPartnerExpansionConvergence
                                                                                            .marketLeaderPositioningConvergence
                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                            .pureOperationalModeTerminus
                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                            .sustainedProductEvolutionReentrant
                                                                                            .era25PostReentrantCharterLock
                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                            .p0ProofStatus !==
                                                                                              "proof_passed" ? (
                                                                                            <Badge
                                                                                              variant="destructive"
                                                                                              className="rounded-full text-[10px]"
                                                                                            >
                                                                                              P0 not proof_passed
                                                                                            </Badge>
                                                                                          ) : null}
                                                                                        </div>
                                                                                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-slate-500">
                                                                                          <span>
                                                                                            {
                                                                                              slice.engineeringPathTerminus
                                                                                                .postTerminusSteadyState
                                                                                                .absolutePathEnd
                                                                                                .linearPathPermanentlyClosed
                                                                                                .step17Forbidden
                                                                                                .era25CharterExit
                                                                                                .firstCharterSliceReadiness
                                                                                                .engineeringGates
                                                                                                .firstProductSliceBlueprint
                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                .paidPilotGoConvergence
                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                .month2MarketReadinessConvergence
                                                                                                .scaleReadinessConvergence
                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                .marketLeaderPositioningConvergence
                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                .pureOperationalModeTerminus
                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                .sustainedProductEvolutionReentrant
                                                                                                .era25PostReentrantCharterLock
                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                .integrityValidateCommand
                                                                                            }
                                                                                          </span>
                                                                                          <span>
                                                                                            {
                                                                                              slice.engineeringPathTerminus
                                                                                                .postTerminusSteadyState
                                                                                                .absolutePathEnd
                                                                                                .linearPathPermanentlyClosed
                                                                                                .step17Forbidden
                                                                                                .era25CharterExit
                                                                                                .firstCharterSliceReadiness
                                                                                                .engineeringGates
                                                                                                .firstProductSliceBlueprint
                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                .paidPilotGoConvergence
                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                .month2MarketReadinessConvergence
                                                                                                .scaleReadinessConvergence
                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                .marketLeaderPositioningConvergence
                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                .pureOperationalModeTerminus
                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                .sustainedProductEvolutionReentrant
                                                                                                .era25PostReentrantCharterLock
                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                .p0StagingProofSmokeCommand
                                                                                            }
                                                                                          </span>
                                                                                        </div>
                                                                                        {slice.engineeringPathTerminus
                                                                                          .postTerminusSteadyState
                                                                                          .absolutePathEnd
                                                                                          .linearPathPermanentlyClosed
                                                                                          .step17Forbidden
                                                                                          .era25CharterExit
                                                                                          .firstCharterSliceReadiness
                                                                                          .engineeringGates
                                                                                          .firstProductSliceBlueprint
                                                                                          .ownerDailyBriefingBreakthrough
                                                                                          .paidPilotGoConvergence
                                                                                          .pilotWeek1ExecutionConvergence
                                                                                          .month2MarketReadinessConvergence
                                                                                          .scaleReadinessConvergence
                                                                                          .seriesAPartnerExpansionConvergence
                                                                                          .marketLeaderPositioningConvergence
                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                          .pureOperationalModeTerminus
                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                          .sustainedProductEvolutionReentrant
                                                                                          .era25PostReentrantCharterLock
                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                          ?.era25ConvergenceGovernanceTerminusFreeze ? (
                                                                                          <div
                                                                                            id="era25-convergence-governance-terminus-freeze"
                                                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-slate-600/40 px-3 py-3"
                                                                                            data-testid="era25-convergence-governance-terminus-freeze-panel"
                                                                                          >
                                                                                            <p className="font-medium text-slate-200/90">
                                                                                              era25 convergence governance terminus freeze
                                                                                            </p>
                                                                                            <p className="mt-1 text-slate-300/80">
                                                                                              {formatEra25ConvergenceGovernanceTerminusFreezeEra25Label(
                                                                                                slice.engineeringPathTerminus
                                                                                                  .postTerminusSteadyState
                                                                                                  .absolutePathEnd
                                                                                                  .linearPathPermanentlyClosed
                                                                                                  .step17Forbidden
                                                                                                  .era25CharterExit
                                                                                                  .firstCharterSliceReadiness
                                                                                                  .engineeringGates
                                                                                                  .firstProductSliceBlueprint
                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                  .paidPilotGoConvergence
                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                  .month2MarketReadinessConvergence
                                                                                                  .scaleReadinessConvergence
                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                  .marketLeaderPositioningConvergence
                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                  .pureOperationalModeTerminus
                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                  .era25PostReentrantCharterLock
                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                  .era25ConvergenceGovernanceTerminusFreeze,
                                                                                              )}
                                                                                            </p>
                                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                              {!slice.engineeringPathTerminus
                                                                                                .postTerminusSteadyState
                                                                                                .absolutePathEnd
                                                                                                .linearPathPermanentlyClosed
                                                                                                .step17Forbidden
                                                                                                .era25CharterExit
                                                                                                .firstCharterSliceReadiness
                                                                                                .engineeringGates
                                                                                                .firstProductSliceBlueprint
                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                .paidPilotGoConvergence
                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                .month2MarketReadinessConvergence
                                                                                                .scaleReadinessConvergence
                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                .marketLeaderPositioningConvergence
                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                .pureOperationalModeTerminus
                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                .sustainedProductEvolutionReentrant
                                                                                                .era25PostReentrantCharterLock
                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                .era25ConvergenceGovernanceTerminusFreezeIntegrityPassed ? (
                                                                                                <Badge
                                                                                                  variant="destructive"
                                                                                                  className="rounded-full text-[10px]"
                                                                                                >
                                                                                                  terminus freeze integrity FAIL
                                                                                                </Badge>
                                                                                              ) : null}
                                                                                              {slice.engineeringPathTerminus
                                                                                                .postTerminusSteadyState
                                                                                                .absolutePathEnd
                                                                                                .linearPathPermanentlyClosed
                                                                                                .step17Forbidden
                                                                                                .era25CharterExit
                                                                                                .firstCharterSliceReadiness
                                                                                                .engineeringGates
                                                                                                .firstProductSliceBlueprint
                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                .paidPilotGoConvergence
                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                .month2MarketReadinessConvergence
                                                                                                .scaleReadinessConvergence
                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                .marketLeaderPositioningConvergence
                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                .pureOperationalModeTerminus
                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                .sustainedProductEvolutionReentrant
                                                                                                .era25PostReentrantCharterLock
                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                .era25ProductConvergenceSurfacesSuppressed ? (
                                                                                                <Badge
                                                                                                  variant="secondary"
                                                                                                  className="rounded-full text-[10px]"
                                                                                                >
                                                                                                  convergence suppressed
                                                                                                </Badge>
                                                                                              ) : null}
                                                                                            </div>
                                                                                            <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                              {
                                                                                                slice.engineeringPathTerminus
                                                                                                  .postTerminusSteadyState
                                                                                                  .absolutePathEnd
                                                                                                  .linearPathPermanentlyClosed
                                                                                                  .step17Forbidden
                                                                                                  .era25CharterExit
                                                                                                  .firstCharterSliceReadiness
                                                                                                  .engineeringGates
                                                                                                  .firstProductSliceBlueprint
                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                  .paidPilotGoConvergence
                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                  .month2MarketReadinessConvergence
                                                                                                  .scaleReadinessConvergence
                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                  .marketLeaderPositioningConvergence
                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                  .pureOperationalModeTerminus
                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                  .era25PostReentrantCharterLock
                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                  .integrityValidateCommand
                                                                                              }
                                                                                            </p>
                                                                                            {slice.engineeringPathTerminus
                                                                                              .postTerminusSteadyState
                                                                                              .absolutePathEnd
                                                                                              .linearPathPermanentlyClosed
                                                                                              .step17Forbidden
                                                                                              .era25CharterExit
                                                                                              .firstCharterSliceReadiness
                                                                                              .engineeringGates
                                                                                              .firstProductSliceBlueprint
                                                                                              .ownerDailyBriefingBreakthrough
                                                                                              .paidPilotGoConvergence
                                                                                              .pilotWeek1ExecutionConvergence
                                                                                              .month2MarketReadinessConvergence
                                                                                              .scaleReadinessConvergence
                                                                                              .seriesAPartnerExpansionConvergence
                                                                                              .marketLeaderPositioningConvergence
                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                              .pureOperationalModeTerminus
                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                              .sustainedProductEvolutionReentrant
                                                                                              .era25PostReentrantCharterLock
                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                              ?.era25BandAMarketProofExecutionSolePath ? (
                                                                                              <div
                                                                                                id="era25-band-a-market-proof-execution-sole-path"
                                                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-600/40 px-3 py-3"
                                                                                                data-testid="era25-band-a-market-proof-execution-sole-path-panel"
                                                                                              >
                                                                                                <p className="font-medium text-emerald-200/90">
                                                                                                  era25 Band A market proof execution sole-path
                                                                                                </p>
                                                                                                <p className="mt-1 text-emerald-300/80">
                                                                                                  {formatEra25BandAMarketProofExecutionSolePathEra25Label(
                                                                                                    slice.engineeringPathTerminus
                                                                                                      .postTerminusSteadyState
                                                                                                      .absolutePathEnd
                                                                                                      .linearPathPermanentlyClosed
                                                                                                      .step17Forbidden
                                                                                                      .era25CharterExit
                                                                                                      .firstCharterSliceReadiness
                                                                                                      .engineeringGates
                                                                                                      .firstProductSliceBlueprint
                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                      .paidPilotGoConvergence
                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                      .month2MarketReadinessConvergence
                                                                                                      .scaleReadinessConvergence
                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                      .marketLeaderPositioningConvergence
                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                      .pureOperationalModeTerminus
                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                      .era25PostReentrantCharterLock
                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                      .era25BandAMarketProofExecutionSolePath,
                                                                                                  )}
                                                                                                </p>
                                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                                  {!slice.engineeringPathTerminus
                                                                                                    .postTerminusSteadyState
                                                                                                    .absolutePathEnd
                                                                                                    .linearPathPermanentlyClosed
                                                                                                    .step17Forbidden
                                                                                                    .era25CharterExit
                                                                                                    .firstCharterSliceReadiness
                                                                                                    .engineeringGates
                                                                                                    .firstProductSliceBlueprint
                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                    .paidPilotGoConvergence
                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                    .month2MarketReadinessConvergence
                                                                                                    .scaleReadinessConvergence
                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                    .marketLeaderPositioningConvergence
                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                    .pureOperationalModeTerminus
                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                    .era25PostReentrantCharterLock
                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                    .era25BandAMarketProofExecutionSolePathIntegrityPassed ? null : (
                                                                                                    <Badge
                                                                                                      variant="destructive"
                                                                                                      className="rounded-full text-[10px]"
                                                                                                    >
                                                                                                      sole-path integrity FAIL
                                                                                                    </Badge>
                                                                                                  )}
                                                                                                  {slice.engineeringPathTerminus
                                                                                                    .postTerminusSteadyState
                                                                                                    .absolutePathEnd
                                                                                                    .linearPathPermanentlyClosed
                                                                                                    .step17Forbidden
                                                                                                    .era25CharterExit
                                                                                                    .firstCharterSliceReadiness
                                                                                                    .engineeringGates
                                                                                                    .firstProductSliceBlueprint
                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                    .paidPilotGoConvergence
                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                    .month2MarketReadinessConvergence
                                                                                                    .scaleReadinessConvergence
                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                    .marketLeaderPositioningConvergence
                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                    .pureOperationalModeTerminus
                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                    .era25PostReentrantCharterLock
                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                    .bandAExecutionSolePathLocked ? (
                                                                                                    <Badge
                                                                                                      variant="secondary"
                                                                                                      className="rounded-full text-[10px]"
                                                                                                    >
                                                                                                      Band A locked
                                                                                                    </Badge>
                                                                                                  ) : null}
                                                                                                </div>
                                                                                                <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                  {
                                                                                                    slice.engineeringPathTerminus
                                                                                                      .postTerminusSteadyState
                                                                                                      .absolutePathEnd
                                                                                                      .linearPathPermanentlyClosed
                                                                                                      .step17Forbidden
                                                                                                      .era25CharterExit
                                                                                                      .firstCharterSliceReadiness
                                                                                                      .engineeringGates
                                                                                                      .firstProductSliceBlueprint
                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                      .paidPilotGoConvergence
                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                      .month2MarketReadinessConvergence
                                                                                                      .scaleReadinessConvergence
                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                      .marketLeaderPositioningConvergence
                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                      .pureOperationalModeTerminus
                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                      .era25PostReentrantCharterLock
                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                      .integrityValidateCommand
                                                                                                  }
                                                                                                </p>
                                                                                                {slice.engineeringPathTerminus
                                                                                                  .postTerminusSteadyState
                                                                                                  .absolutePathEnd
                                                                                                  .linearPathPermanentlyClosed
                                                                                                  .step17Forbidden
                                                                                                  .era25CharterExit
                                                                                                  .firstCharterSliceReadiness
                                                                                                  .engineeringGates
                                                                                                  .firstProductSliceBlueprint
                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                  .paidPilotGoConvergence
                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                  .month2MarketReadinessConvergence
                                                                                                  .scaleReadinessConvergence
                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                  .marketLeaderPositioningConvergence
                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                  .pureOperationalModeTerminus
                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                  .era25PostReentrantCharterLock
                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                  ?.era25P0MarketProofHonestClosureCapstone ? (
                                                                                                  <div
                                                                                                    id="era25-p0-market-proof-honest-closure-capstone"
                                                                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-amber-600/40 px-3 py-3"
                                                                                                    data-testid="era25-p0-market-proof-honest-closure-capstone-panel"
                                                                                                  >
                                                                                                    <p className="font-medium text-amber-200/90">
                                                                                                      era25 P0 market proof honest closure capstone
                                                                                                    </p>
                                                                                                    <p className="mt-1 text-amber-300/80">
                                                                                                      {formatEra25P0MarketProofHonestClosureCapstoneEra25Label(
                                                                                                        slice.engineeringPathTerminus
                                                                                                          .postTerminusSteadyState
                                                                                                          .absolutePathEnd
                                                                                                          .linearPathPermanentlyClosed
                                                                                                          .step17Forbidden
                                                                                                          .era25CharterExit
                                                                                                          .firstCharterSliceReadiness
                                                                                                          .engineeringGates
                                                                                                          .firstProductSliceBlueprint
                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                          .paidPilotGoConvergence
                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                          .month2MarketReadinessConvergence
                                                                                                          .scaleReadinessConvergence
                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                          .marketLeaderPositioningConvergence
                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                          .pureOperationalModeTerminus
                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                          .era25PostReentrantCharterLock
                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                          .era25P0MarketProofHonestClosureCapstone,
                                                                                                      )}
                                                                                                    </p>
                                                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                                                      {!slice.engineeringPathTerminus
                                                                                                        .postTerminusSteadyState
                                                                                                        .absolutePathEnd
                                                                                                        .linearPathPermanentlyClosed
                                                                                                        .step17Forbidden
                                                                                                        .era25CharterExit
                                                                                                        .firstCharterSliceReadiness
                                                                                                        .engineeringGates
                                                                                                        .firstProductSliceBlueprint
                                                                                                        .ownerDailyBriefingBreakthrough
                                                                                                        .paidPilotGoConvergence
                                                                                                        .pilotWeek1ExecutionConvergence
                                                                                                        .month2MarketReadinessConvergence
                                                                                                        .scaleReadinessConvergence
                                                                                                        .seriesAPartnerExpansionConvergence
                                                                                                        .marketLeaderPositioningConvergence
                                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                                        .pureOperationalModeTerminus
                                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                                        .sustainedProductEvolutionReentrant
                                                                                                        .era25PostReentrantCharterLock
                                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                                        .era25CommercialPilotConvergenceTrainCapstone
                                                                                                        .era25ConvergenceGovernanceTerminusFreeze
                                                                                                        .era25BandAMarketProofExecutionSolePath
                                                                                                        .era25P0MarketProofHonestClosureCapstone
                                                                                                        .era25P0MarketProofHonestClosureCapstoneIntegrityPassed ? null : (
                                                                                                        <Badge
                                                                                                          variant="destructive"
                                                                                                          className="rounded-full text-[10px]"
                                                                                                        >
                                                                                                          closure integrity FAIL
                                                                                                        </Badge>
                                                                                                      )}
                                                                                                      {slice.engineeringPathTerminus
                                                                                                        .postTerminusSteadyState
                                                                                                        .absolutePathEnd
                                                                                                        .linearPathPermanentlyClosed
                                                                                                        .step17Forbidden
                                                                                                        .era25CharterExit
                                                                                                        .firstCharterSliceReadiness
                                                                                                        .engineeringGates
                                                                                                        .firstProductSliceBlueprint
                                                                                                        .ownerDailyBriefingBreakthrough
                                                                                                        .paidPilotGoConvergence
                                                                                                        .pilotWeek1ExecutionConvergence
                                                                                                        .month2MarketReadinessConvergence
                                                                                                        .scaleReadinessConvergence
                                                                                                        .seriesAPartnerExpansionConvergence
                                                                                                        .marketLeaderPositioningConvergence
                                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                                        .pureOperationalModeTerminus
                                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                                        .sustainedProductEvolutionReentrant
                                                                                                        .era25PostReentrantCharterLock
                                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                                        .era25CommercialPilotConvergenceTrainCapstone
                                                                                                        .era25ConvergenceGovernanceTerminusFreeze
                                                                                                        .era25BandAMarketProofExecutionSolePath
                                                                                                        .era25P0MarketProofHonestClosureCapstone
                                                                                                        .era25MarketProofGovernanceChainClosed ? (
                                                                                                        <Badge
                                                                                                          variant="secondary"
                                                                                                          className="rounded-full text-[10px]"
                                                                                                        >
                                                                                                          governance closed
                                                                                                        </Badge>
                                                                                                      ) : null}
                                                                                                    </div>
                                                                                                    <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                      {
                                                                                                        slice.engineeringPathTerminus
                                                                                                          .postTerminusSteadyState
                                                                                                          .absolutePathEnd
                                                                                                          .linearPathPermanentlyClosed
                                                                                                          .step17Forbidden
                                                                                                          .era25CharterExit
                                                                                                          .firstCharterSliceReadiness
                                                                                                          .engineeringGates
                                                                                                          .firstProductSliceBlueprint
                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                          .paidPilotGoConvergence
                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                          .month2MarketReadinessConvergence
                                                                                                          .scaleReadinessConvergence
                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                          .marketLeaderPositioningConvergence
                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                          .pureOperationalModeTerminus
                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                          .era25PostReentrantCharterLock
                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                          .era25P0MarketProofHonestClosureCapstone
                                                                                                          .integrityValidateCommand
                                                                                                      }
                                                                                                    </p>
                                                                                                    {slice.engineeringPathTerminus
                                                                                                      .postTerminusSteadyState
                                                                                                      .absolutePathEnd
                                                                                                      .linearPathPermanentlyClosed
                                                                                                      .step17Forbidden
                                                                                                      .era25CharterExit
                                                                                                      .firstCharterSliceReadiness
                                                                                                      .engineeringGates
                                                                                                      .firstProductSliceBlueprint
                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                      .paidPilotGoConvergence
                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                      .month2MarketReadinessConvergence
                                                                                                      .scaleReadinessConvergence
                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                      .marketLeaderPositioningConvergence
                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                      .pureOperationalModeTerminus
                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                      .era25PostReentrantCharterLock
                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                      ?.era25PostMarketProofSteadyOperationalWitness ? (
                                                                                                      <div
                                                                                                        id="era25-post-market-proof-steady-operational-witness"
                                                                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-600/40 px-3 py-3"
                                                                                                        data-testid="era25-post-market-proof-steady-operational-witness-panel"
                                                                                                      >
                                                                                                        <p className="font-medium text-emerald-200/90">
                                                                                                          era25 post-market steady ops witness
                                                                                                        </p>
                                                                                                        <p className="mt-1 text-emerald-300/80">
                                                                                                          {formatEra25PostMarketProofSteadyOperationalWitnessEra25Label(
                                                                                                            slice.engineeringPathTerminus
                                                                                                              .postTerminusSteadyState
                                                                                                              .absolutePathEnd
                                                                                                              .linearPathPermanentlyClosed
                                                                                                              .step17Forbidden
                                                                                                              .era25CharterExit
                                                                                                              .firstCharterSliceReadiness
                                                                                                              .engineeringGates
                                                                                                              .firstProductSliceBlueprint
                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                              .paidPilotGoConvergence
                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                              .month2MarketReadinessConvergence
                                                                                                              .scaleReadinessConvergence
                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                              .marketLeaderPositioningConvergence
                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                              .pureOperationalModeTerminus
                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                              .era25PostReentrantCharterLock
                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                              .era25PostMarketProofSteadyOperationalWitness,
                                                                                                          )}
                                                                                                        </p>
                                                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                                                          {!slice.engineeringPathTerminus
                                                                                                            .postTerminusSteadyState
                                                                                                            .absolutePathEnd
                                                                                                            .linearPathPermanentlyClosed
                                                                                                            .step17Forbidden
                                                                                                            .era25CharterExit
                                                                                                            .firstCharterSliceReadiness
                                                                                                            .engineeringGates
                                                                                                            .firstProductSliceBlueprint
                                                                                                            .ownerDailyBriefingBreakthrough
                                                                                                            .paidPilotGoConvergence
                                                                                                            .pilotWeek1ExecutionConvergence
                                                                                                            .month2MarketReadinessConvergence
                                                                                                            .scaleReadinessConvergence
                                                                                                            .seriesAPartnerExpansionConvergence
                                                                                                            .marketLeaderPositioningConvergence
                                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                                            .pureOperationalModeTerminus
                                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                                            .sustainedProductEvolutionReentrant
                                                                                                            .era25PostReentrantCharterLock
                                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                                            .era25ConvergenceGovernanceTerminusFreeze
                                                                                                            .era25BandAMarketProofExecutionSolePath
                                                                                                            .era25P0MarketProofHonestClosureCapstone
                                                                                                            .era25PostMarketProofSteadyOperationalWitness
                                                                                                            .era25PostMarketProofSteadyOperationalWitnessIntegrityPassed ? null : (
                                                                                                            <Badge
                                                                                                              variant="destructive"
                                                                                                              className="rounded-full text-[10px]"
                                                                                                            >
                                                                                                              witness integrity FAIL
                                                                                                            </Badge>
                                                                                                          )}
                                                                                                          {slice.engineeringPathTerminus
                                                                                                            .postTerminusSteadyState
                                                                                                            .absolutePathEnd
                                                                                                            .linearPathPermanentlyClosed
                                                                                                            .step17Forbidden
                                                                                                            .era25CharterExit
                                                                                                            .firstCharterSliceReadiness
                                                                                                            .engineeringGates
                                                                                                            .firstProductSliceBlueprint
                                                                                                            .ownerDailyBriefingBreakthrough
                                                                                                            .paidPilotGoConvergence
                                                                                                            .pilotWeek1ExecutionConvergence
                                                                                                            .month2MarketReadinessConvergence
                                                                                                            .scaleReadinessConvergence
                                                                                                            .seriesAPartnerExpansionConvergence
                                                                                                            .marketLeaderPositioningConvergence
                                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                                            .pureOperationalModeTerminus
                                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                                            .sustainedProductEvolutionReentrant
                                                                                                            .era25PostReentrantCharterLock
                                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                                            .era25ConvergenceGovernanceTerminusFreeze
                                                                                                            .era25BandAMarketProofExecutionSolePath
                                                                                                            .era25P0MarketProofHonestClosureCapstone
                                                                                                            .era25PostMarketProofSteadyOperationalWitness
                                                                                                            .postMarketProofSteadyOpsWitnessActive ? (
                                                                                                            <Badge
                                                                                                              variant="secondary"
                                                                                                              className="rounded-full text-[10px]"
                                                                                                            >
                                                                                                              steady ops witness
                                                                                                            </Badge>
                                                                                                          ) : null}
                                                                                                        </div>
                                                                                                        <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                          {
                                                                                                            slice.engineeringPathTerminus
                                                                                                              .postTerminusSteadyState
                                                                                                              .absolutePathEnd
                                                                                                              .linearPathPermanentlyClosed
                                                                                                              .step17Forbidden
                                                                                                              .era25CharterExit
                                                                                                              .firstCharterSliceReadiness
                                                                                                              .engineeringGates
                                                                                                              .firstProductSliceBlueprint
                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                              .paidPilotGoConvergence
                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                              .month2MarketReadinessConvergence
                                                                                                              .scaleReadinessConvergence
                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                              .marketLeaderPositioningConvergence
                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                              .pureOperationalModeTerminus
                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                              .era25PostReentrantCharterLock
                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                              .era25PostMarketProofSteadyOperationalWitness
                                                                                                              .integrityValidateCommand
                                                                                                          }
                                                                                                        </p>
                                                                                                        {slice.engineeringPathTerminus
                                                                                                          .postTerminusSteadyState
                                                                                                          .absolutePathEnd
                                                                                                          .linearPathPermanentlyClosed
                                                                                                          .step17Forbidden
                                                                                                          .era25CharterExit
                                                                                                          .firstCharterSliceReadiness
                                                                                                          .engineeringGates
                                                                                                          .firstProductSliceBlueprint
                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                          .paidPilotGoConvergence
                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                          .month2MarketReadinessConvergence
                                                                                                          .scaleReadinessConvergence
                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                          .marketLeaderPositioningConvergence
                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                          .pureOperationalModeTerminus
                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                          .era25PostReentrantCharterLock
                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                          .era25P0MarketProofHonestClosureCapstone
                                                                                                          .era25PostMarketProofSteadyOperationalWitness
                                                                                                          ?.era25GovernanceTrainTerminalSeal ? (
                                                                                                          <div
                                                                                                            id="era25-governance-train-terminal-seal"
                                                                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-600/40 px-3 py-3"
                                                                                                            data-testid="era25-governance-train-terminal-seal-panel"
                                                                                                          >
                                                                                                            <p className="font-medium text-violet-200/90">
                                                                                                              era25 governance train terminal seal
                                                                                                            </p>
                                                                                                            <p className="mt-1 text-violet-300/80">
                                                                                                              {formatEra25GovernanceTrainTerminalSealEra25Label(
                                                                                                                slice.engineeringPathTerminus
                                                                                                                  .postTerminusSteadyState
                                                                                                                  .absolutePathEnd
                                                                                                                  .linearPathPermanentlyClosed
                                                                                                                  .step17Forbidden
                                                                                                                  .era25CharterExit
                                                                                                                  .firstCharterSliceReadiness
                                                                                                                  .engineeringGates
                                                                                                                  .firstProductSliceBlueprint
                                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                                  .paidPilotGoConvergence
                                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                                  .month2MarketReadinessConvergence
                                                                                                                  .scaleReadinessConvergence
                                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                                  .marketLeaderPositioningConvergence
                                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                                  .pureOperationalModeTerminus
                                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                                  .era25PostReentrantCharterLock
                                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                                  .era25P0MarketProofHonestClosureCapstone
                                                                                                                  .era25PostMarketProofSteadyOperationalWitness
                                                                                                                  .era25GovernanceTrainTerminalSeal,
                                                                                                              )}
                                                                                                            </p>
                                                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                                              {!slice.engineeringPathTerminus
                                                                                                                .postTerminusSteadyState
                                                                                                                .absolutePathEnd
                                                                                                                .linearPathPermanentlyClosed
                                                                                                                .step17Forbidden
                                                                                                                .era25CharterExit
                                                                                                                .firstCharterSliceReadiness
                                                                                                                .engineeringGates
                                                                                                                .firstProductSliceBlueprint
                                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                                .paidPilotGoConvergence
                                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                                .month2MarketReadinessConvergence
                                                                                                                .scaleReadinessConvergence
                                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                                .marketLeaderPositioningConvergence
                                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                                .pureOperationalModeTerminus
                                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                                .sustainedProductEvolutionReentrant
                                                                                                                .era25PostReentrantCharterLock
                                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                .era25BandAMarketProofExecutionSolePath
                                                                                                                .era25P0MarketProofHonestClosureCapstone
                                                                                                                .era25PostMarketProofSteadyOperationalWitness
                                                                                                                .era25GovernanceTrainTerminalSeal
                                                                                                                .era25GovernanceTrainTerminalSealIntegrityPassed ? null : (
                                                                                                                <Badge
                                                                                                                  variant="destructive"
                                                                                                                  className="rounded-full text-[10px]"
                                                                                                                >
                                                                                                                  seal integrity FAIL
                                                                                                                </Badge>
                                                                                                              )}
                                                                                                              {slice.engineeringPathTerminus
                                                                                                                .postTerminusSteadyState
                                                                                                                .absolutePathEnd
                                                                                                                .linearPathPermanentlyClosed
                                                                                                                .step17Forbidden
                                                                                                                .era25CharterExit
                                                                                                                .firstCharterSliceReadiness
                                                                                                                .engineeringGates
                                                                                                                .firstProductSliceBlueprint
                                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                                .paidPilotGoConvergence
                                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                                .month2MarketReadinessConvergence
                                                                                                                .scaleReadinessConvergence
                                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                                .marketLeaderPositioningConvergence
                                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                                .pureOperationalModeTerminus
                                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                                .sustainedProductEvolutionReentrant
                                                                                                                .era25PostReentrantCharterLock
                                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                .era25BandAMarketProofExecutionSolePath
                                                                                                                .era25P0MarketProofHonestClosureCapstone
                                                                                                                .era25PostMarketProofSteadyOperationalWitness
                                                                                                                .era25GovernanceTrainTerminalSeal
                                                                                                                .era25GovernanceTrainSealed ? (
                                                                                                                <Badge
                                                                                                                  variant="secondary"
                                                                                                                  className="rounded-full text-[10px]"
                                                                                                                >
                                                                                                                  train sealed
                                                                                                                </Badge>
                                                                                                              ) : null}
                                                                                                            </div>
                                                                                                            <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                              {
                                                                                                                slice.engineeringPathTerminus
                                                                                                                  .postTerminusSteadyState
                                                                                                                  .absolutePathEnd
                                                                                                                  .linearPathPermanentlyClosed
                                                                                                                  .step17Forbidden
                                                                                                                  .era25CharterExit
                                                                                                                  .firstCharterSliceReadiness
                                                                                                                  .engineeringGates
                                                                                                                  .firstProductSliceBlueprint
                                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                                  .paidPilotGoConvergence
                                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                                  .month2MarketReadinessConvergence
                                                                                                                  .scaleReadinessConvergence
                                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                                  .marketLeaderPositioningConvergence
                                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                                  .pureOperationalModeTerminus
                                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                                  .era25PostReentrantCharterLock
                                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                                  .era25P0MarketProofHonestClosureCapstone
                                                                                                                  .era25PostMarketProofSteadyOperationalWitness
                                                                                                                  .era25GovernanceTrainTerminalSeal
                                                                                                                  .integrityValidateCommand
                                                                                                              }
                                                                                                            </p>
                                                                                                            {slice.engineeringPathTerminus
                                                                                                              .postTerminusSteadyState
                                                                                                              .absolutePathEnd
                                                                                                              .linearPathPermanentlyClosed
                                                                                                              .step17Forbidden
                                                                                                              .era25CharterExit
                                                                                                              .firstCharterSliceReadiness
                                                                                                              .engineeringGates
                                                                                                              .firstProductSliceBlueprint
                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                              .paidPilotGoConvergence
                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                              .month2MarketReadinessConvergence
                                                                                                              .scaleReadinessConvergence
                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                              .marketLeaderPositioningConvergence
                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                              .pureOperationalModeTerminus
                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                              .era25PostReentrantCharterLock
                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                              .era25PostMarketProofSteadyOperationalWitness
                                                                                                              .era25GovernanceTrainTerminalSeal
                                                                                                              ?.era25PostTerminalSealCommercialOpsPermanence ? (
                                                                                                              <div
                                                                                                                id="era25-post-terminal-seal-commercial-ops-permanence"
                                                                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-sky-600/40 px-3 py-3"
                                                                                                                data-testid="era25-post-terminal-seal-commercial-ops-permanence-panel"
                                                                                                              >
                                                                                                                <p className="font-medium text-sky-200/90">
                                                                                                                  era25 post-seal commercial ops permanence
                                                                                                                </p>
                                                                                                                <p className="mt-1 text-sky-300/80">
                                                                                                                  {formatEra25PostTerminalSealCommercialOpsPermanenceEra25Label(
                                                                                                                    slice.engineeringPathTerminus
                                                                                                                      .postTerminusSteadyState
                                                                                                                      .absolutePathEnd
                                                                                                                      .linearPathPermanentlyClosed
                                                                                                                      .step17Forbidden
                                                                                                                      .era25CharterExit
                                                                                                                      .firstCharterSliceReadiness
                                                                                                                      .engineeringGates
                                                                                                                      .firstProductSliceBlueprint
                                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                                      .paidPilotGoConvergence
                                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                                      .month2MarketReadinessConvergence
                                                                                                                      .scaleReadinessConvergence
                                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                                      .marketLeaderPositioningConvergence
                                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                                      .pureOperationalModeTerminus
                                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                                      .era25PostReentrantCharterLock
                                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                                      .era25PostMarketProofSteadyOperationalWitness
                                                                                                                      .era25GovernanceTrainTerminalSeal
                                                                                                                      .era25PostTerminalSealCommercialOpsPermanence,
                                                                                                                  )}
                                                                                                                </p>
                                                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                                                  {!slice.engineeringPathTerminus
                                                                                                                    .postTerminusSteadyState
                                                                                                                    .absolutePathEnd
                                                                                                                    .linearPathPermanentlyClosed
                                                                                                                    .step17Forbidden
                                                                                                                    .era25CharterExit
                                                                                                                    .firstCharterSliceReadiness
                                                                                                                    .engineeringGates
                                                                                                                    .firstProductSliceBlueprint
                                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                                    .paidPilotGoConvergence
                                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                                    .month2MarketReadinessConvergence
                                                                                                                    .scaleReadinessConvergence
                                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                                    .marketLeaderPositioningConvergence
                                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                                    .pureOperationalModeTerminus
                                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                                    .era25PostReentrantCharterLock
                                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                                    .era25P0MarketProofHonestClosureCapstone
                                                                                                                    .era25PostMarketProofSteadyOperationalWitness
                                                                                                                    .era25GovernanceTrainTerminalSeal
                                                                                                                    .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                    .era25PostTerminalSealCommercialOpsPermanenceIntegrityPassed ? null : (
                                                                                                                    <Badge
                                                                                                                      variant="destructive"
                                                                                                                      className="rounded-full text-[10px]"
                                                                                                                    >
                                                                                                                      permanence integrity FAIL
                                                                                                                    </Badge>
                                                                                                                  )}
                                                                                                                  {slice.engineeringPathTerminus
                                                                                                                    .postTerminusSteadyState
                                                                                                                    .absolutePathEnd
                                                                                                                    .linearPathPermanentlyClosed
                                                                                                                    .step17Forbidden
                                                                                                                    .era25CharterExit
                                                                                                                    .firstCharterSliceReadiness
                                                                                                                    .engineeringGates
                                                                                                                    .firstProductSliceBlueprint
                                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                                    .paidPilotGoConvergence
                                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                                    .month2MarketReadinessConvergence
                                                                                                                    .scaleReadinessConvergence
                                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                                    .marketLeaderPositioningConvergence
                                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                                    .pureOperationalModeTerminus
                                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                                    .era25PostReentrantCharterLock
                                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                                    .era25P0MarketProofHonestClosureCapstone
                                                                                                                    .era25PostMarketProofSteadyOperationalWitness
                                                                                                                    .era25GovernanceTrainTerminalSeal
                                                                                                                    .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                    .postTerminalSealCommercialOpsPermanenceActive ? (
                                                                                                                    <Badge
                                                                                                                      variant="secondary"
                                                                                                                      className="rounded-full text-[10px]"
                                                                                                                    >
                                                                                                                      ops permanence
                                                                                                                    </Badge>
                                                                                                                  ) : null}
                                                                                                                </div>
                                                                                                                <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                                  {
                                                                                                                    slice.engineeringPathTerminus
                                                                                                                      .postTerminusSteadyState
                                                                                                                      .absolutePathEnd
                                                                                                                      .linearPathPermanentlyClosed
                                                                                                                      .step17Forbidden
                                                                                                                      .era25CharterExit
                                                                                                                      .firstCharterSliceReadiness
                                                                                                                      .engineeringGates
                                                                                                                      .firstProductSliceBlueprint
                                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                                      .paidPilotGoConvergence
                                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                                      .month2MarketReadinessConvergence
                                                                                                                      .scaleReadinessConvergence
                                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                                      .marketLeaderPositioningConvergence
                                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                                      .pureOperationalModeTerminus
                                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                                      .era25PostReentrantCharterLock
                                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                                      .era25PostMarketProofSteadyOperationalWitness
                                                                                                                      .era25GovernanceTrainTerminalSeal
                                                                                                                      .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                      .integrityValidateCommand
                                                                                                                  }
                                                                                                                </p>
                                                                                                                {slice.engineeringPathTerminus
                                                                                                                  .postTerminusSteadyState
                                                                                                                  .absolutePathEnd
                                                                                                                  .linearPathPermanentlyClosed
                                                                                                                  .step17Forbidden
                                                                                                                  .era25CharterExit
                                                                                                                  .firstCharterSliceReadiness
                                                                                                                  .engineeringGates
                                                                                                                  .firstProductSliceBlueprint
                                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                                  .paidPilotGoConvergence
                                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                                  .month2MarketReadinessConvergence
                                                                                                                  .scaleReadinessConvergence
                                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                                  .marketLeaderPositioningConvergence
                                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                                  .pureOperationalModeTerminus
                                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                                  .era25PostReentrantCharterLock
                                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                                  .era25P0MarketProofHonestClosureCapstone
                                                                                                                  .era25PostMarketProofSteadyOperationalWitness
                                                                                                                  .era25GovernanceTrainTerminalSeal
                                                                                                                  .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                  ?.era25BandAGovernanceChainCapstoneWitness ? (
                                                                                                                  <div
                                                                                                                    id="era25-band-a-governance-chain-capstone-witness"
                                                                                                                    className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-violet-600/40 px-3 py-3"
                                                                                                                    data-testid="era25-band-a-governance-chain-capstone-witness-panel"
                                                                                                                  >
                                                                                                                    <p className="font-medium text-violet-200/90">
                                                                                                                      era25 Band A governance chain capstone witness
                                                                                                                    </p>
                                                                                                                    <p className="mt-1 text-violet-300/80">
                                                                                                                      {formatEra25BandAGovernanceChainCapstoneWitnessEra25Label(
                                                                                                                        slice.engineeringPathTerminus
                                                                                                                          .postTerminusSteadyState
                                                                                                                          .absolutePathEnd
                                                                                                                          .linearPathPermanentlyClosed
                                                                                                                          .step17Forbidden
                                                                                                                          .era25CharterExit
                                                                                                                          .firstCharterSliceReadiness
                                                                                                                          .engineeringGates
                                                                                                                          .firstProductSliceBlueprint
                                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                                          .paidPilotGoConvergence
                                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                                          .month2MarketReadinessConvergence
                                                                                                                          .scaleReadinessConvergence
                                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                                          .marketLeaderPositioningConvergence
                                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                                          .pureOperationalModeTerminus
                                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                                          .era25PostReentrantCharterLock
                                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                                          .era25P0MarketProofHonestClosureCapstone
                                                                                                                          .era25PostMarketProofSteadyOperationalWitness
                                                                                                                          .era25GovernanceTrainTerminalSeal
                                                                                                                          .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                          .era25BandAGovernanceChainCapstoneWitness,
                                                                                                                      )}
                                                                                                                    </p>
                                                                                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                                                                                      {!slice.engineeringPathTerminus
                                                                                                                        .postTerminusSteadyState
                                                                                                                        .absolutePathEnd
                                                                                                                        .linearPathPermanentlyClosed
                                                                                                                        .step17Forbidden
                                                                                                                        .era25CharterExit
                                                                                                                        .firstCharterSliceReadiness
                                                                                                                        .engineeringGates
                                                                                                                        .firstProductSliceBlueprint
                                                                                                                        .ownerDailyBriefingBreakthrough
                                                                                                                        .paidPilotGoConvergence
                                                                                                                        .pilotWeek1ExecutionConvergence
                                                                                                                        .month2MarketReadinessConvergence
                                                                                                                        .scaleReadinessConvergence
                                                                                                                        .seriesAPartnerExpansionConvergence
                                                                                                                        .marketLeaderPositioningConvergence
                                                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                                                        .pureOperationalModeTerminus
                                                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                                                        .sustainedProductEvolutionReentrant
                                                                                                                        .era25PostReentrantCharterLock
                                                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                                                        .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                        .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                        .era25BandAMarketProofExecutionSolePath
                                                                                                                        .era25P0MarketProofHonestClosureCapstone
                                                                                                                        .era25PostMarketProofSteadyOperationalWitness
                                                                                                                        .era25GovernanceTrainTerminalSeal
                                                                                                                        .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                        .era25BandAGovernanceChainCapstoneWitness
                                                                                                                        .era25BandAGovernanceChainCapstoneWitnessIntegrityPassed ? null : (
                                                                                                                        <Badge
                                                                                                                          variant="destructive"
                                                                                                                          className="rounded-full text-[10px]"
                                                                                                                        >
                                                                                                                          capstone integrity FAIL
                                                                                                                        </Badge>
                                                                                                                      )}
                                                                                                                      {slice.engineeringPathTerminus
                                                                                                                        .postTerminusSteadyState
                                                                                                                        .absolutePathEnd
                                                                                                                        .linearPathPermanentlyClosed
                                                                                                                        .step17Forbidden
                                                                                                                        .era25CharterExit
                                                                                                                        .firstCharterSliceReadiness
                                                                                                                        .engineeringGates
                                                                                                                        .firstProductSliceBlueprint
                                                                                                                        .ownerDailyBriefingBreakthrough
                                                                                                                        .paidPilotGoConvergence
                                                                                                                        .pilotWeek1ExecutionConvergence
                                                                                                                        .month2MarketReadinessConvergence
                                                                                                                        .scaleReadinessConvergence
                                                                                                                        .seriesAPartnerExpansionConvergence
                                                                                                                        .marketLeaderPositioningConvergence
                                                                                                                        .sustainedOperationalExcellenceConvergence
                                                                                                                        .pureOperationalModeTerminus
                                                                                                                        .commercialPilotConvergenceTrainClosure
                                                                                                                        .sustainedProductEvolutionReentrant
                                                                                                                        .era25PostReentrantCharterLock
                                                                                                                        .era25SteadyStateOperatorLoopLock
                                                                                                                        .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                        .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                        .era25BandAMarketProofExecutionSolePath
                                                                                                                        .era25P0MarketProofHonestClosureCapstone
                                                                                                                        .era25PostMarketProofSteadyOperationalWitness
                                                                                                                        .era25GovernanceTrainTerminalSeal
                                                                                                                        .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                        .era25BandAGovernanceChainCapstoneWitness
                                                                                                                        .bandAGovernanceChainCapstoneWitnessActive ? (
                                                                                                                        <Badge
                                                                                                                          variant="secondary"
                                                                                                                          className="rounded-full text-[10px]"
                                                                                                                        >
                                                                                                                          Band A closed
                                                                                                                        </Badge>
                                                                                                                      ) : null}
                                                                                                                    </div>
                                                                                                                    <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                                      {
                                                                                                                        slice.engineeringPathTerminus
                                                                                                                          .postTerminusSteadyState
                                                                                                                          .absolutePathEnd
                                                                                                                          .linearPathPermanentlyClosed
                                                                                                                          .step17Forbidden
                                                                                                                          .era25CharterExit
                                                                                                                          .firstCharterSliceReadiness
                                                                                                                          .engineeringGates
                                                                                                                          .firstProductSliceBlueprint
                                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                                          .paidPilotGoConvergence
                                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                                          .month2MarketReadinessConvergence
                                                                                                                          .scaleReadinessConvergence
                                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                                          .marketLeaderPositioningConvergence
                                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                                          .pureOperationalModeTerminus
                                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                                          .era25PostReentrantCharterLock
                                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                                          .era25P0MarketProofHonestClosureCapstone
                                                                                                                          .era25PostMarketProofSteadyOperationalWitness
                                                                                                                          .era25GovernanceTrainTerminalSeal
                                                                                                                          .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                          .era25BandAGovernanceChainCapstoneWitness
                                                                                                                          .integrityValidateCommand
                                                                                                                      }
                                                                                                                    </p>
                                                                                                                    {slice.engineeringPathTerminus
                                                                                                                      .postTerminusSteadyState
                                                                                                                      .absolutePathEnd
                                                                                                                      .linearPathPermanentlyClosed
                                                                                                                      .step17Forbidden
                                                                                                                      .era25CharterExit
                                                                                                                      .firstCharterSliceReadiness
                                                                                                                      .engineeringGates
                                                                                                                      .firstProductSliceBlueprint
                                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                                      .paidPilotGoConvergence
                                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                                      .month2MarketReadinessConvergence
                                                                                                                      .scaleReadinessConvergence
                                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                                      .marketLeaderPositioningConvergence
                                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                                      .pureOperationalModeTerminus
                                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                                      .era25PostReentrantCharterLock
                                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                                      .era25PostMarketProofSteadyOperationalWitness
                                                                                                                      .era25GovernanceTrainTerminalSeal
                                                                                                                      .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                      .era25BandAGovernanceChainCapstoneWitness
                                                                                                                      ?.era25PostBandAGovernanceSteadyProductModeWitness ? (
                                                                                                                      <div
                                                                                                                        id="era25-post-band-a-governance-steady-product-mode-witness"
                                                                                                                        className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-600/40 px-3 py-3"
                                                                                                                        data-testid="era25-post-band-a-governance-steady-product-mode-witness-panel"
                                                                                                                      >
                                                                                                                        <p className="font-medium text-emerald-200/90">
                                                                                                                          era25 post-governance steady product mode witness
                                                                                                                        </p>
                                                                                                                        <p className="mt-1 text-emerald-300/80">
                                                                                                                          {formatEra25PostBandAGovernanceSteadyProductModeWitnessEra25Label(
                                                                                                                            slice.engineeringPathTerminus
                                                                                                                              .postTerminusSteadyState
                                                                                                                              .absolutePathEnd
                                                                                                                              .linearPathPermanentlyClosed
                                                                                                                              .step17Forbidden
                                                                                                                              .era25CharterExit
                                                                                                                              .firstCharterSliceReadiness
                                                                                                                              .engineeringGates
                                                                                                                              .firstProductSliceBlueprint
                                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                                              .paidPilotGoConvergence
                                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                                              .month2MarketReadinessConvergence
                                                                                                                              .scaleReadinessConvergence
                                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                                              .marketLeaderPositioningConvergence
                                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                                              .pureOperationalModeTerminus
                                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                                              .era25PostReentrantCharterLock
                                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                                              .era25PostMarketProofSteadyOperationalWitness
                                                                                                                              .era25GovernanceTrainTerminalSeal
                                                                                                                              .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                              .era25BandAGovernanceChainCapstoneWitness
                                                                                                                              .era25PostBandAGovernanceSteadyProductModeWitness,
                                                                                                                          )}
                                                                                                                        </p>
                                                                                                                        <div className="mt-2 flex flex-wrap gap-2">
                                                                                                                          {!slice.engineeringPathTerminus
                                                                                                                            .postTerminusSteadyState
                                                                                                                            .absolutePathEnd
                                                                                                                            .linearPathPermanentlyClosed
                                                                                                                            .step17Forbidden
                                                                                                                            .era25CharterExit
                                                                                                                            .firstCharterSliceReadiness
                                                                                                                            .engineeringGates
                                                                                                                            .firstProductSliceBlueprint
                                                                                                                            .ownerDailyBriefingBreakthrough
                                                                                                                            .paidPilotGoConvergence
                                                                                                                            .pilotWeek1ExecutionConvergence
                                                                                                                            .month2MarketReadinessConvergence
                                                                                                                            .scaleReadinessConvergence
                                                                                                                            .seriesAPartnerExpansionConvergence
                                                                                                                            .marketLeaderPositioningConvergence
                                                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                                                            .pureOperationalModeTerminus
                                                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                                                            .sustainedProductEvolutionReentrant
                                                                                                                            .era25PostReentrantCharterLock
                                                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                            .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                            .era25BandAMarketProofExecutionSolePath
                                                                                                                            .era25P0MarketProofHonestClosureCapstone
                                                                                                                            .era25PostMarketProofSteadyOperationalWitness
                                                                                                                            .era25GovernanceTrainTerminalSeal
                                                                                                                            .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                            .era25BandAGovernanceChainCapstoneWitness
                                                                                                                            .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                            .era25PostBandAGovernanceSteadyProductModeWitnessIntegrityPassed ? null : (
                                                                                                                            <Badge
                                                                                                                              variant="destructive"
                                                                                                                              className="rounded-full text-[10px]"
                                                                                                                            >
                                                                                                                              steady mode integrity FAIL
                                                                                                                            </Badge>
                                                                                                                          )}
                                                                                                                          {slice.engineeringPathTerminus
                                                                                                                            .postTerminusSteadyState
                                                                                                                            .absolutePathEnd
                                                                                                                            .linearPathPermanentlyClosed
                                                                                                                            .step17Forbidden
                                                                                                                            .era25CharterExit
                                                                                                                            .firstCharterSliceReadiness
                                                                                                                            .engineeringGates
                                                                                                                            .firstProductSliceBlueprint
                                                                                                                            .ownerDailyBriefingBreakthrough
                                                                                                                            .paidPilotGoConvergence
                                                                                                                            .pilotWeek1ExecutionConvergence
                                                                                                                            .month2MarketReadinessConvergence
                                                                                                                            .scaleReadinessConvergence
                                                                                                                            .seriesAPartnerExpansionConvergence
                                                                                                                            .marketLeaderPositioningConvergence
                                                                                                                            .sustainedOperationalExcellenceConvergence
                                                                                                                            .pureOperationalModeTerminus
                                                                                                                            .commercialPilotConvergenceTrainClosure
                                                                                                                            .sustainedProductEvolutionReentrant
                                                                                                                            .era25PostReentrantCharterLock
                                                                                                                            .era25SteadyStateOperatorLoopLock
                                                                                                                            .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                            .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                            .era25BandAMarketProofExecutionSolePath
                                                                                                                            .era25P0MarketProofHonestClosureCapstone
                                                                                                                            .era25PostMarketProofSteadyOperationalWitness
                                                                                                                            .era25GovernanceTrainTerminalSeal
                                                                                                                            .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                            .era25BandAGovernanceChainCapstoneWitness
                                                                                                                            .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                            .postBandAGovernanceSteadyProductModeWitnessActive ? (
                                                                                                                            <Badge
                                                                                                                              variant="secondary"
                                                                                                                              className="rounded-full text-[10px]"
                                                                                                                            >
                                                                                                                              steady product mode
                                                                                                                            </Badge>
                                                                                                                          ) : null}
                                                                                                                        </div>
                                                                                                                        <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                                          {
                                                                                                                            slice.engineeringPathTerminus
                                                                                                                              .postTerminusSteadyState
                                                                                                                              .absolutePathEnd
                                                                                                                              .linearPathPermanentlyClosed
                                                                                                                              .step17Forbidden
                                                                                                                              .era25CharterExit
                                                                                                                              .firstCharterSliceReadiness
                                                                                                                              .engineeringGates
                                                                                                                              .firstProductSliceBlueprint
                                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                                              .paidPilotGoConvergence
                                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                                              .month2MarketReadinessConvergence
                                                                                                                              .scaleReadinessConvergence
                                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                                              .marketLeaderPositioningConvergence
                                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                                              .pureOperationalModeTerminus
                                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                                              .era25PostReentrantCharterLock
                                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                                              .era25PostMarketProofSteadyOperationalWitness
                                                                                                                              .era25GovernanceTrainTerminalSeal
                                                                                                                              .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                              .era25BandAGovernanceChainCapstoneWitness
                                                                                                                              .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                              .integrityValidateCommand
                                                                                                                          }
                                                                                                                        </p>
                                                                                                                        {slice.engineeringPathTerminus
                                                                                                                          .postTerminusSteadyState
                                                                                                                          .absolutePathEnd
                                                                                                                          .linearPathPermanentlyClosed
                                                                                                                          .step17Forbidden
                                                                                                                          .era25CharterExit
                                                                                                                          .firstCharterSliceReadiness
                                                                                                                          .engineeringGates
                                                                                                                          .firstProductSliceBlueprint
                                                                                                                          .ownerDailyBriefingBreakthrough
                                                                                                                          .paidPilotGoConvergence
                                                                                                                          .pilotWeek1ExecutionConvergence
                                                                                                                          .month2MarketReadinessConvergence
                                                                                                                          .scaleReadinessConvergence
                                                                                                                          .seriesAPartnerExpansionConvergence
                                                                                                                          .marketLeaderPositioningConvergence
                                                                                                                          .sustainedOperationalExcellenceConvergence
                                                                                                                          .pureOperationalModeTerminus
                                                                                                                          .commercialPilotConvergenceTrainClosure
                                                                                                                          .sustainedProductEvolutionReentrant
                                                                                                                          .era25PostReentrantCharterLock
                                                                                                                          .era25SteadyStateOperatorLoopLock
                                                                                                                          .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                          .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                          .era25BandAMarketProofExecutionSolePath
                                                                                                                          .era25P0MarketProofHonestClosureCapstone
                                                                                                                          .era25PostMarketProofSteadyOperationalWitness
                                                                                                                          .era25GovernanceTrainTerminalSeal
                                                                                                                          .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                          .era25BandAGovernanceChainCapstoneWitness
                                                                                                                          .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                          ?.era25PostSteadyProductModeCommercialOpsRhythmPermanence ? (
                                                                                                                          <div
                                                                                                                            id="era25-post-steady-product-mode-commercial-ops-rhythm-permanence"
                                                                                                                            className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-amber-600/40 px-3 py-3"
                                                                                                                            data-testid="era25-post-steady-product-mode-commercial-ops-rhythm-permanence-panel"
                                                                                                                          >
                                                                                                                            <p className="font-medium text-amber-200/90">
                                                                                                                              era25 commercial ops rhythm permanence
                                                                                                                            </p>
                                                                                                                            <p className="mt-1 text-amber-300/80">
                                                                                                                              {formatEra25PostSteadyProductModeCommercialOpsRhythmPermanenceEra25Label(
                                                                                                                                slice.engineeringPathTerminus
                                                                                                                                  .postTerminusSteadyState
                                                                                                                                  .absolutePathEnd
                                                                                                                                  .linearPathPermanentlyClosed
                                                                                                                                  .step17Forbidden
                                                                                                                                  .era25CharterExit
                                                                                                                                  .firstCharterSliceReadiness
                                                                                                                                  .engineeringGates
                                                                                                                                  .firstProductSliceBlueprint
                                                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                                                  .paidPilotGoConvergence
                                                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                                                  .month2MarketReadinessConvergence
                                                                                                                                  .scaleReadinessConvergence
                                                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                                                  .marketLeaderPositioningConvergence
                                                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                                                  .pureOperationalModeTerminus
                                                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                                                  .era25PostReentrantCharterLock
                                                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                                                  .era25P0MarketProofHonestClosureCapstone
                                                                                                                                  .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                  .era25GovernanceTrainTerminalSeal
                                                                                                                                  .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                  .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                  .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                  .era25PostSteadyProductModeCommercialOpsRhythmPermanence,
                                                                                                                              )}
                                                                                                                            </p>
                                                                                                                            <div className="mt-2 flex flex-wrap gap-2">
                                                                                                                              {!slice.engineeringPathTerminus
                                                                                                                                .postTerminusSteadyState
                                                                                                                                .absolutePathEnd
                                                                                                                                .linearPathPermanentlyClosed
                                                                                                                                .step17Forbidden
                                                                                                                                .era25CharterExit
                                                                                                                                .firstCharterSliceReadiness
                                                                                                                                .engineeringGates
                                                                                                                                .firstProductSliceBlueprint
                                                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                                                .paidPilotGoConvergence
                                                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                                                .month2MarketReadinessConvergence
                                                                                                                                .scaleReadinessConvergence
                                                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                                                .marketLeaderPositioningConvergence
                                                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                                                .pureOperationalModeTerminus
                                                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                                                .sustainedProductEvolutionReentrant
                                                                                                                                .era25PostReentrantCharterLock
                                                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                .era25BandAMarketProofExecutionSolePath
                                                                                                                                .era25P0MarketProofHonestClosureCapstone
                                                                                                                                .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                .era25GovernanceTrainTerminalSeal
                                                                                                                                .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                .era25PostSteadyProductModeCommercialOpsRhythmPermanenceIntegrityPassed ? null : (
                                                                                                                                <Badge
                                                                                                                                  variant="destructive"
                                                                                                                                  className="rounded-full text-[10px]"
                                                                                                                                >
                                                                                                                                  rhythm permanence integrity FAIL
                                                                                                                                </Badge>
                                                                                                                              )}
                                                                                                                              {slice.engineeringPathTerminus
                                                                                                                                .postTerminusSteadyState
                                                                                                                                .absolutePathEnd
                                                                                                                                .linearPathPermanentlyClosed
                                                                                                                                .step17Forbidden
                                                                                                                                .era25CharterExit
                                                                                                                                .firstCharterSliceReadiness
                                                                                                                                .engineeringGates
                                                                                                                                .firstProductSliceBlueprint
                                                                                                                                .ownerDailyBriefingBreakthrough
                                                                                                                                .paidPilotGoConvergence
                                                                                                                                .pilotWeek1ExecutionConvergence
                                                                                                                                .month2MarketReadinessConvergence
                                                                                                                                .scaleReadinessConvergence
                                                                                                                                .seriesAPartnerExpansionConvergence
                                                                                                                                .marketLeaderPositioningConvergence
                                                                                                                                .sustainedOperationalExcellenceConvergence
                                                                                                                                .pureOperationalModeTerminus
                                                                                                                                .commercialPilotConvergenceTrainClosure
                                                                                                                                .sustainedProductEvolutionReentrant
                                                                                                                                .era25PostReentrantCharterLock
                                                                                                                                .era25SteadyStateOperatorLoopLock
                                                                                                                                .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                .era25BandAMarketProofExecutionSolePath
                                                                                                                                .era25P0MarketProofHonestClosureCapstone
                                                                                                                                .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                .era25GovernanceTrainTerminalSeal
                                                                                                                                .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                .postSteadyProductModeCommercialOpsRhythmPermanenceActive ? (
                                                                                                                                <Badge
                                                                                                                                  variant="secondary"
                                                                                                                                  className="rounded-full text-[10px]"
                                                                                                                                >
                                                                                                                                  ops rhythm permanent
                                                                                                                                </Badge>
                                                                                                                              ) : null}
                                                                                                                            </div>
                                                                                                                            <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                                              {
                                                                                                                                slice.engineeringPathTerminus
                                                                                                                                  .postTerminusSteadyState
                                                                                                                                  .absolutePathEnd
                                                                                                                                  .linearPathPermanentlyClosed
                                                                                                                                  .step17Forbidden
                                                                                                                                  .era25CharterExit
                                                                                                                                  .firstCharterSliceReadiness
                                                                                                                                  .engineeringGates
                                                                                                                                  .firstProductSliceBlueprint
                                                                                                                                  .ownerDailyBriefingBreakthrough
                                                                                                                                  .paidPilotGoConvergence
                                                                                                                                  .pilotWeek1ExecutionConvergence
                                                                                                                                  .month2MarketReadinessConvergence
                                                                                                                                  .scaleReadinessConvergence
                                                                                                                                  .seriesAPartnerExpansionConvergence
                                                                                                                                  .marketLeaderPositioningConvergence
                                                                                                                                  .sustainedOperationalExcellenceConvergence
                                                                                                                                  .pureOperationalModeTerminus
                                                                                                                                  .commercialPilotConvergenceTrainClosure
                                                                                                                                  .sustainedProductEvolutionReentrant
                                                                                                                                  .era25PostReentrantCharterLock
                                                                                                                                  .era25SteadyStateOperatorLoopLock
                                                                                                                                  .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                  .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                  .era25BandAMarketProofExecutionSolePath
                                                                                                                                  .era25P0MarketProofHonestClosureCapstone
                                                                                                                                  .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                  .era25GovernanceTrainTerminalSeal
                                                                                                                                  .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                  .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                  .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                  .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                  .integrityValidateCommand
                                                                                                                              }
                                                                                                                            </p>
                                                                                                                            {slice.engineeringPathTerminus
                                                                                                                              .postTerminusSteadyState
                                                                                                                              .absolutePathEnd
                                                                                                                              .linearPathPermanentlyClosed
                                                                                                                              .step17Forbidden
                                                                                                                              .era25CharterExit
                                                                                                                              .firstCharterSliceReadiness
                                                                                                                              .engineeringGates
                                                                                                                              .firstProductSliceBlueprint
                                                                                                                              .ownerDailyBriefingBreakthrough
                                                                                                                              .paidPilotGoConvergence
                                                                                                                              .pilotWeek1ExecutionConvergence
                                                                                                                              .month2MarketReadinessConvergence
                                                                                                                              .scaleReadinessConvergence
                                                                                                                              .seriesAPartnerExpansionConvergence
                                                                                                                              .marketLeaderPositioningConvergence
                                                                                                                              .sustainedOperationalExcellenceConvergence
                                                                                                                              .pureOperationalModeTerminus
                                                                                                                              .commercialPilotConvergenceTrainClosure
                                                                                                                              .sustainedProductEvolutionReentrant
                                                                                                                              .era25PostReentrantCharterLock
                                                                                                                              .era25SteadyStateOperatorLoopLock
                                                                                                                              .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                              .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                              .era25BandAMarketProofExecutionSolePath
                                                                                                                              .era25P0MarketProofHonestClosureCapstone
                                                                                                                              .era25PostMarketProofSteadyOperationalWitness
                                                                                                                              .era25GovernanceTrainTerminalSeal
                                                                                                                              .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                              .era25BandAGovernanceChainCapstoneWitness
                                                                                                                              .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                              .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                              ?.era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness ? (
                                                                                                                              <div
                                                                                                                                id="era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness"
                                                                                                                                className="mt-3 scroll-mt-24 rounded-lg border border-dashed border-emerald-600/40 px-3 py-3"
                                                                                                                                data-testid="era25-post-rhythm-permanence-band-a-governance-terminal-closure-witness-panel"
                                                                                                                              >
                                                                                                                                <p className="font-medium text-emerald-200/90">
                                                                                                                                  era25 Band A governance terminal closure witness
                                                                                                                                </p>
                                                                                                                                <p className="mt-1 text-emerald-300/80">
                                                                                                                                  {formatEra25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessEra25Label(
                                                                                                                                    slice.engineeringPathTerminus
                                                                                                                                      .postTerminusSteadyState
                                                                                                                                      .absolutePathEnd
                                                                                                                                      .linearPathPermanentlyClosed
                                                                                                                                      .step17Forbidden
                                                                                                                                      .era25CharterExit
                                                                                                                                      .firstCharterSliceReadiness
                                                                                                                                      .engineeringGates
                                                                                                                                      .firstProductSliceBlueprint
                                                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                                                      .paidPilotGoConvergence
                                                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                                                      .month2MarketReadinessConvergence
                                                                                                                                      .scaleReadinessConvergence
                                                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                                                      .marketLeaderPositioningConvergence
                                                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                                                      .pureOperationalModeTerminus
                                                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                                                      .era25PostReentrantCharterLock
                                                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                                                      .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                      .era25GovernanceTrainTerminalSeal
                                                                                                                                      .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                      .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                      .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                      .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                      .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness,
                                                                                                                                  )}
                                                                                                                                </p>
                                                                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                                                                  {!slice.engineeringPathTerminus
                                                                                                                                    .postTerminusSteadyState
                                                                                                                                    .absolutePathEnd
                                                                                                                                    .linearPathPermanentlyClosed
                                                                                                                                    .step17Forbidden
                                                                                                                                    .era25CharterExit
                                                                                                                                    .firstCharterSliceReadiness
                                                                                                                                    .engineeringGates
                                                                                                                                    .firstProductSliceBlueprint
                                                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                                                    .paidPilotGoConvergence
                                                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                                                    .month2MarketReadinessConvergence
                                                                                                                                    .scaleReadinessConvergence
                                                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                                                    .marketLeaderPositioningConvergence
                                                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                                                    .pureOperationalModeTerminus
                                                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                                                    .era25PostReentrantCharterLock
                                                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                                                    .era25P0MarketProofHonestClosureCapstone
                                                                                                                                    .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                    .era25GovernanceTrainTerminalSeal
                                                                                                                                    .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                    .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                    .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                    .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                    .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness
                                                                                                                                    .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitnessIntegrityPassed ? null : (
                                                                                                                                    <Badge
                                                                                                                                      variant="destructive"
                                                                                                                                      className="rounded-full text-[10px]"
                                                                                                                                    >
                                                                                                                                      terminal closure witness integrity FAIL
                                                                                                                                    </Badge>
                                                                                                                                  )}
                                                                                                                                  {slice.engineeringPathTerminus
                                                                                                                                    .postTerminusSteadyState
                                                                                                                                    .absolutePathEnd
                                                                                                                                    .linearPathPermanentlyClosed
                                                                                                                                    .step17Forbidden
                                                                                                                                    .era25CharterExit
                                                                                                                                    .firstCharterSliceReadiness
                                                                                                                                    .engineeringGates
                                                                                                                                    .firstProductSliceBlueprint
                                                                                                                                    .ownerDailyBriefingBreakthrough
                                                                                                                                    .paidPilotGoConvergence
                                                                                                                                    .pilotWeek1ExecutionConvergence
                                                                                                                                    .month2MarketReadinessConvergence
                                                                                                                                    .scaleReadinessConvergence
                                                                                                                                    .seriesAPartnerExpansionConvergence
                                                                                                                                    .marketLeaderPositioningConvergence
                                                                                                                                    .sustainedOperationalExcellenceConvergence
                                                                                                                                    .pureOperationalModeTerminus
                                                                                                                                    .commercialPilotConvergenceTrainClosure
                                                                                                                                    .sustainedProductEvolutionReentrant
                                                                                                                                    .era25PostReentrantCharterLock
                                                                                                                                    .era25SteadyStateOperatorLoopLock
                                                                                                                                    .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                    .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                    .era25BandAMarketProofExecutionSolePath
                                                                                                                                    .era25P0MarketProofHonestClosureCapstone
                                                                                                                                    .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                    .era25GovernanceTrainTerminalSeal
                                                                                                                                    .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                    .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                    .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                    .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                    .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness
                                                                                                                                    .postRhythmPermanenceBandAGovernanceTerminalClosureWitnessActive ? (
                                                                                                                                    <Badge
                                                                                                                                      variant="secondary"
                                                                                                                                      className="rounded-full text-[10px]"
                                                                                                                                    >
                                                                                                                                      Band A closed
                                                                                                                                    </Badge>
                                                                                                                                  ) : null}
                                                                                                                                </div>
                                                                                                                                <p className="mt-2 font-mono text-[10px] text-slate-500">
                                                                                                                                  {
                                                                                                                                    slice.engineeringPathTerminus
                                                                                                                                      .postTerminusSteadyState
                                                                                                                                      .absolutePathEnd
                                                                                                                                      .linearPathPermanentlyClosed
                                                                                                                                      .step17Forbidden
                                                                                                                                      .era25CharterExit
                                                                                                                                      .firstCharterSliceReadiness
                                                                                                                                      .engineeringGates
                                                                                                                                      .firstProductSliceBlueprint
                                                                                                                                      .ownerDailyBriefingBreakthrough
                                                                                                                                      .paidPilotGoConvergence
                                                                                                                                      .pilotWeek1ExecutionConvergence
                                                                                                                                      .month2MarketReadinessConvergence
                                                                                                                                      .scaleReadinessConvergence
                                                                                                                                      .seriesAPartnerExpansionConvergence
                                                                                                                                      .marketLeaderPositioningConvergence
                                                                                                                                      .sustainedOperationalExcellenceConvergence
                                                                                                                                      .pureOperationalModeTerminus
                                                                                                                                      .commercialPilotConvergenceTrainClosure
                                                                                                                                      .sustainedProductEvolutionReentrant
                                                                                                                                      .era25PostReentrantCharterLock
                                                                                                                                      .era25SteadyStateOperatorLoopLock
                                                                                                                                      .era25CommercialPilotConvergenceTrainCapstone
                                                                                                                                      .era25ConvergenceGovernanceTerminusFreeze
                                                                                                                                      .era25BandAMarketProofExecutionSolePath
                                                                                                                                      .era25P0MarketProofHonestClosureCapstone
                                                                                                                                      .era25PostMarketProofSteadyOperationalWitness
                                                                                                                                      .era25GovernanceTrainTerminalSeal
                                                                                                                                      .era25PostTerminalSealCommercialOpsPermanence
                                                                                                                                      .era25BandAGovernanceChainCapstoneWitness
                                                                                                                                      .era25PostBandAGovernanceSteadyProductModeWitness
                                                                                                                                      .era25PostSteadyProductModeCommercialOpsRhythmPermanence
                                                                                                                                      .era25PostRhythmPermanenceBandAGovernanceTerminalClosureWitness
                                                                                                                                      .integrityValidateCommand
                                                                                                                                  }
                                                                                                                                </p>
                                                                                                                              </div>
                                                                                                                            ) : null}
                                                                                                                          </div>
                                                                                                                        ) : null}
                                                                                                                      </div>
                                                                                                                    ) : null}
                                                                                                                  </div>
                                                                                                                ) : null}
                                                                                                              </div>
                                                                                                            ) : null}
                                                                                                          </div>
                                                                                                        ) : null}
                                                                                                      </div>
                                                                                                    ) : null}
                                                                                                  </div>
                                                                                                ) : null}
                                                                                              </div>
                                                                                            ) : null}
                                                                                          </div>
                                                                                        ) : null}
                                                                                      </div>
                                                                                    ) : null}
                                                                                  </div>
                                                                                ) : null}
                                                                              </div>
                                                                            ) : null}
                                                                          </div>
                                                                        ) : null}
                                                                      </div>
                                                                    ) : null}
                                                                  </div>
                                                                ) : null}
                                                              </div>
                                                            ) : null}
                                                          </div>
                                                        ) : null}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                ) : null}
                                              </div>
                                            ) : null}
                                          </div>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
    </>
  );
}
